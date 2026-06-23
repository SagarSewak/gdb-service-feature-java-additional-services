package com.gdb.bankstatements.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class StatementDto {
    private String id;
    private String accountId;
    private LocalDate fromDate;
    private LocalDate toDate;
    private String format;
    private String status;
    private String downloadUrl;
}
