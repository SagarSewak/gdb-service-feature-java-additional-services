package com.gdb.bankstatements.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "statements")
@Data
public class Statement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(name = "account_id")
    private String accountId;
    
    @Column(name = "from_date")
    private LocalDate fromDate;
    
    @Column(name = "to_date")
    private LocalDate toDate;
    
    private String format; // PDF, CSV
    
    private String status = "GENERATING"; // GENERATING, COMPLETED, FAILED
    
    @Column(name = "download_url")
    private String downloadUrl;
}
