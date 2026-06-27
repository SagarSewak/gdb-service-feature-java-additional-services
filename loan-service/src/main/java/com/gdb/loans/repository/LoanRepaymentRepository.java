package com.gdb.loans.repository;

import com.gdb.loans.domain.model.LoanRepayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LoanRepaymentRepository extends JpaRepository<LoanRepayment, Long> {
    List<LoanRepayment> findByLoanIdOrderByPaidDateDesc(Long loanId);
    long countByLoanId(Long loanId);
}
