package com.gdb.creditcards.repository;

import com.gdb.creditcards.domain.CreditCardTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CreditCardTransactionRepository extends JpaRepository<CreditCardTransaction, String> {
    List<CreditCardTransaction> findByCardIdOrderByDateDesc(String cardId);
}
