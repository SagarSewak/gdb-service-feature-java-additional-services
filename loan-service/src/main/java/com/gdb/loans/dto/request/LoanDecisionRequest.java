package com.gdb.loans.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class LoanDecisionRequest {
    private String remarks;
    @JsonProperty("interest_rate")
    private java.math.BigDecimal interestRate;
}
