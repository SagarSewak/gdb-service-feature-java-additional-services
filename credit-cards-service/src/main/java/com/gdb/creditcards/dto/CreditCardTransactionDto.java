package com.gdb.creditcards.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditCardTransactionDto {
    private String id;
    private String cardId;
    private LocalDateTime date;
    private String merchant;
    private Double amount;
    private String type; // Purchase, Payment, Refund
    private String status; // Completed, Pending
    private String pin;
}
