package com.gdb.loans.repository;

import com.gdb.loans.domain.enums.LoanStatus;
import com.gdb.loans.domain.model.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findByLoginIdOrderByAppliedDateDesc(String loginId);
    List<Loan> findByStatusOrderByAppliedDateDesc(LoanStatus status);
    List<Loan> findAllByOrderByAppliedDateDesc();
}
