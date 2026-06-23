package com.gdb.creditcards.repository;

import com.gdb.creditcards.domain.CreditCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CreditCardRepository extends JpaRepository<CreditCard, String> {
    List<CreditCard> findByUserId(Long userId);
}
