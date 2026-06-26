package com.gdb.creditcards.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "credit_cards")
@Data
public class CreditCard {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "card_number")
    private String cardNumber;
    
    @Column(name = "card_type")
    private String cardType; // SILVER, GOLD, PLATINUM
    
    @Column(name = "credit_limit")
    private BigDecimal creditLimit;
    
    @Column(name = "available_credit")
    private BigDecimal availableCredit;
    
    @Column(name = "outstanding_amount")
    private BigDecimal outstandingAmount;
    
    @Column(name = "minimum_due")
    private BigDecimal minimumDue;
    
    @Column(name = "next_due_date")
    private LocalDate nextDueDate;
    
    private String status = "ACTIVE"; // ACTIVE, INACTIVE, BLOCKED

    private String name;

    @Column(name = "mobile_number")
    private String mobileNumber;

    @Column(name = "expiry_date")
    private String expiryDate;

    private String cvv;

    private String nickname;

    private String pin;
}

