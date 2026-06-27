package com.gdb.bankstatements.repository;

import com.gdb.bankstatements.domain.Statement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StatementRepository extends JpaRepository<Statement, String> {
}
