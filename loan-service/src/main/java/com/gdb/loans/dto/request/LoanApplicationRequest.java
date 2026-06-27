package com.gdb.loans.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.gdb.loans.domain.enums.LoanType;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class LoanApplicationRequest {
    @NotBlank(message = "Account number is required")
    @JsonProperty("account_number")
    private String accountNumber;

    @NotNull(message = "Loan type is required")
    @JsonProperty("loan_type")
    private LoanType loanType;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "10000", message = "Minimum loan amount is ₹10,000")
    @DecimalMax(value = "10000000", message = "Maximum loan amount is ₹1,00,00,000")
    private BigDecimal amount;

    @NotNull(message = "Tenure is required")
    @Min(value = 6, message = "Minimum tenure is 6 months")
    @Max(value = 360, message = "Maximum tenure is 360 months")
    @JsonProperty("tenure_months")
    private Integer tenureMonths;

    @NotBlank(message = "Purpose is required")
    @Size(max = 500, message = "Purpose cannot exceed 500 characters")
    private String purpose;
}
