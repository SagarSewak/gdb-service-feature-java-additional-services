package com.gdb.loans.service.impl;

import com.gdb.loans.domain.enums.LoanStatus;
import com.gdb.loans.domain.enums.LoanType;
import com.gdb.loans.domain.model.Loan;
import com.gdb.loans.domain.model.LoanRepayment;
import com.gdb.loans.dto.request.LoanApplicationRequest;
import com.gdb.loans.dto.request.LoanDecisionRequest;
import com.gdb.loans.dto.response.LoanResponse;
import com.gdb.loans.dto.response.RepaymentResponse;
import com.gdb.loans.repository.LoanRepaymentRepository;
import com.gdb.loans.repository.LoanRepository;
import com.gdb.loans.service.LoanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoanServiceImpl implements LoanService {

    private final LoanRepository loanRepository;
    private final LoanRepaymentRepository repaymentRepository;

    // Default interest rates per loan type (annual %)
    private static final java.util.Map<LoanType, BigDecimal> DEFAULT_RATES = java.util.Map.of(
        LoanType.PERSONAL,  new BigDecimal("12.00"),
        LoanType.HOME,      new BigDecimal("8.50"),
        LoanType.CAR,       new BigDecimal("9.00"),
        LoanType.BUSINESS,  new BigDecimal("14.00"),
        LoanType.EDUCATION, new BigDecimal("7.50")
    );

    @Override
    @Transactional
    public LoanResponse applyForLoan(String loginId, LoanApplicationRequest request) {
        BigDecimal rate = DEFAULT_RATES.getOrDefault(request.getLoanType(), new BigDecimal("12.00"));
        BigDecimal emi = calculateEmi(request.getAmount(), rate, request.getTenureMonths());

        Loan loan = Loan.builder()
            .loginId(loginId)
            .accountNumber(request.getAccountNumber())
            .loanType(request.getLoanType())
            .amount(request.getAmount())
            .interestRate(rate)
            .tenureMonths(request.getTenureMonths())
            .emiAmount(emi)
            .status(LoanStatus.PENDING)
            .purpose(request.getPurpose())
            .appliedDate(LocalDateTime.now())
            .totalPaid(BigDecimal.ZERO)
            .build();

        return toResponse(loanRepository.save(loan));
    }

    @Override
    public List<LoanResponse> getLoansByUser(String loginId) {
        return loanRepository.findByLoginIdOrderByAppliedDateDesc(loginId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<LoanResponse> getAllLoans() {
        return loanRepository.findAllByOrderByAppliedDateDesc()
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public LoanResponse getLoanById(Long id) {
        return toResponse(findLoan(id));
    }

    @Override
    @Transactional
    public LoanResponse approveLoan(Long id, LoanDecisionRequest request) {
        Loan loan = findLoan(id);
        if (loan.getStatus() != LoanStatus.PENDING) throw new IllegalStateException("Loan is not in PENDING status");
        if (request.getInterestRate() != null) loan.setInterestRate(request.getInterestRate());
        loan.setEmiAmount(calculateEmi(loan.getAmount(), loan.getInterestRate(), loan.getTenureMonths()));
        loan.setStatus(LoanStatus.APPROVED);
        loan.setApprovedDate(LocalDateTime.now());
        loan.setRemarks(request.getRemarks());
        return toResponse(loanRepository.save(loan));
    }

    @Override
    @Transactional
    public LoanResponse rejectLoan(Long id, LoanDecisionRequest request) {
        Loan loan = findLoan(id);
        if (loan.getStatus() != LoanStatus.PENDING) throw new IllegalStateException("Loan is not in PENDING status");
        loan.setStatus(LoanStatus.REJECTED);
        loan.setRemarks(request.getRemarks());
        return toResponse(loanRepository.save(loan));
    }

    @Override
    @Transactional
    public RepaymentResponse makeRepayment(Long loanId, BigDecimal amount) {
        Loan loan = findLoan(loanId);
        if (loan.getStatus() != LoanStatus.APPROVED && loan.getStatus() != LoanStatus.ACTIVE) {
            throw new IllegalStateException("Loan is not active");
        }
        loan.setStatus(LoanStatus.ACTIVE);
        long emiNumber = repaymentRepository.countByLoanId(loanId) + 1;
        BigDecimal newTotalPaid = loan.getTotalPaid().add(amount);
        loan.setTotalPaid(newTotalPaid);

        // Close loan if fully paid
        BigDecimal totalOwed = loan.getAmount()
            .multiply(BigDecimal.ONE.add(loan.getInterestRate().divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal(loan.getTenureMonths()))
                .divide(new BigDecimal("12"), 4, RoundingMode.HALF_UP)));
        if (newTotalPaid.compareTo(totalOwed) >= 0) {
            loan.setStatus(LoanStatus.CLOSED);
            loan.setClosedDate(LocalDateTime.now());
        }
        loanRepository.save(loan);

        LoanRepayment repayment = LoanRepayment.builder()
            .loanId(loanId)
            .amount(amount)
            .paidDate(LocalDateTime.now())
            .emiNumber((int) emiNumber)
            .build();
        return toRepaymentResponse(repaymentRepository.save(repayment));
    }

    @Override
    public List<RepaymentResponse> getRepayments(Long loanId) {
        return repaymentRepository.findByLoanIdOrderByPaidDateDesc(loanId)
            .stream().map(this::toRepaymentResponse).collect(Collectors.toList());
    }

    private Loan findLoan(Long id) {
        return loanRepository.findById(id).orElseThrow(() -> new RuntimeException("Loan not found: " + id));
    }

    // EMI = P * r * (1+r)^n / ((1+r)^n - 1)  where r = monthly interest rate
    private BigDecimal calculateEmi(BigDecimal principal, BigDecimal annualRate, int months) {
        BigDecimal r = annualRate.divide(new BigDecimal("1200"), 10, RoundingMode.HALF_UP);
        BigDecimal onePlusR = BigDecimal.ONE.add(r);
        BigDecimal power = onePlusR.pow(months, new MathContext(10));
        BigDecimal numerator = principal.multiply(r).multiply(power);
        BigDecimal denominator = power.subtract(BigDecimal.ONE);
        return numerator.divide(denominator, 2, RoundingMode.HALF_UP);
    }

    private LoanResponse toResponse(Loan loan) {
        BigDecimal remaining = loan.getAmount().subtract(loan.getTotalPaid());
        return LoanResponse.builder()
            .id(loan.getId())
            .loginId(loan.getLoginId())
            .accountNumber(loan.getAccountNumber())
            .loanType(loan.getLoanType())
            .amount(loan.getAmount())
            .interestRate(loan.getInterestRate())
            .tenureMonths(loan.getTenureMonths())
            .emiAmount(loan.getEmiAmount())
            .status(loan.getStatus())
            .purpose(loan.getPurpose())
            .appliedDate(loan.getAppliedDate())
            .approvedDate(loan.getApprovedDate())
            .closedDate(loan.getClosedDate())
            .totalPaid(loan.getTotalPaid())
            .remainingAmount(remaining.max(BigDecimal.ZERO))
            .remarks(loan.getRemarks())
            .build();
    }

    private RepaymentResponse toRepaymentResponse(LoanRepayment r) {
        return RepaymentResponse.builder()
            .id(r.getId()).loanId(r.getLoanId())
            .amount(r.getAmount()).paidDate(r.getPaidDate()).emiNumber(r.getEmiNumber())
            .build();
    }
}
