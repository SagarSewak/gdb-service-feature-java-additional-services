package com.gdb.creditcards.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "credit_cards")
@Data
public class CreditCard {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(name = "user_id")
    private String userId;
    
    @Column(name = "card_number")
    private String cardNumber;
    
    @Column(name = "card_type")
    private String cardType; // SILVER, GOLD, PLATINUM
    
    @Column(name = "credit_limit")
    private Double creditLimit;
    
    @Column(name = "available_credit")
    private Double availableCredit;
    
    @Column(name = "outstanding_amount")
    private Double outstandingAmount;
    
    @Column(name = "minimum_due")
    private Double minimumDue;
    
    @Column(name = "next_due_date")
    private LocalDate nextDueDate;
    
    private String status = "ACTIVE"; // ACTIVE, INACTIVE, BLOCKED
}
