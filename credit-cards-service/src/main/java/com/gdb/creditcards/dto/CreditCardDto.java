package com.gdb.creditcards.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class CreditCardDto {
    private String id;
    private String userId;
    private String cardNumber;
    private String cardType;
    private Double creditLimit;
    private Double availableCredit;
    private Double outstandingAmount;
    private Double minimumDue;
    private LocalDate nextDueDate;
    private String status;
}
