package com.gdb.loans.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class RepaymentResponse {
    private Long id;
    @JsonProperty("loan_id") private Long loanId;
    private BigDecimal amount;
    @JsonProperty("paid_date") private LocalDateTime paidDate;
    @JsonProperty("emi_number") private Integer emiNumber;
}
