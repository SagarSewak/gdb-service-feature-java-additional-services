package com.gdb.loans.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.gdb.loans.domain.enums.LoanStatus;
import com.gdb.loans.domain.enums.LoanType;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class LoanResponse {
    private Long id;
    @JsonProperty("login_id") private String loginId;
    @JsonProperty("account_number") private String accountNumber;
    @JsonProperty("loan_type") private LoanType loanType;
    private BigDecimal amount;
    @JsonProperty("interest_rate") private BigDecimal interestRate;
    @JsonProperty("tenure_months") private Integer tenureMonths;
    @JsonProperty("emi_amount") private BigDecimal emiAmount;
    private LoanStatus status;
    private String purpose;
    @JsonProperty("applied_date") private LocalDateTime appliedDate;
    @JsonProperty("approved_date") private LocalDateTime approvedDate;
    @JsonProperty("closed_date") private LocalDateTime closedDate;
    @JsonProperty("total_paid") private BigDecimal totalPaid;
    @JsonProperty("remaining_amount") private BigDecimal remainingAmount;
    private String remarks;
}
