package com.gdb.creditcards.service;

import com.gdb.creditcards.dto.CreditCardDto;
import com.gdb.creditcards.dto.CreditCardTransactionDto;

import java.util.List;
import java.util.Map;

public interface CreditCardService {
    List<CreditCardDto> getCardsByUserId(String userId);
    CreditCardDto getCardById(String cardId);
    CreditCardDto applyForCard(String userId, CreditCardDto application);
    List<CreditCardTransactionDto> getTransactions(String cardId, String type, String fromDate, String toDate);
    Map<String, Object> payBill(String cardId, Double amount, Long debitAccount);
    CreditCardTransactionDto createTransaction(String cardId, CreditCardTransactionDto transactionDto);
}
