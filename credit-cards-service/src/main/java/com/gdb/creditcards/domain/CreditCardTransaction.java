package com.gdb.creditcards.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "credit_card_transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditCardTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "card_id")
    private String cardId;

    private LocalDateTime date;

    private String merchant;

    private BigDecimal amount;

    private String type; // Purchase, Payment, Refund

    private String status; // Completed, Pending
}

