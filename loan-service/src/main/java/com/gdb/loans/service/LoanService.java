package com.gdb.loans.service;

import com.gdb.loans.dto.request.LoanApplicationRequest;
import com.gdb.loans.dto.request.LoanDecisionRequest;
import com.gdb.loans.dto.response.LoanResponse;
import com.gdb.loans.dto.response.RepaymentResponse;
import java.math.BigDecimal;
import java.util.List;

public interface LoanService {
    LoanResponse applyForLoan(String loginId, LoanApplicationRequest request);
    List<LoanResponse> getLoansByUser(String loginId);
    List<LoanResponse> getAllLoans();
    LoanResponse getLoanById(Long id);
    LoanResponse approveLoan(Long id, LoanDecisionRequest request);
    LoanResponse rejectLoan(Long id, LoanDecisionRequest request);
    RepaymentResponse makeRepayment(Long loanId, BigDecimal amount);
    List<RepaymentResponse> getRepayments(Long loanId);
}
