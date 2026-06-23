package com.gdb.creditcards.client;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;

@Component
@Slf4j
@RequiredArgsConstructor
public class AccountServiceClient {

    private final RestTemplate restTemplate;

    @Value("${app.services.accounts-url:http://localhost:8001}")
    private String accountServiceUrl;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AccountOperationRequest {
        private Long accountNumber;
        private BigDecimal amount;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AccountOperationResponse {
        private Long accountNumber;
        private BigDecimal amount;
        private BigDecimal newBalance;
        private String status;
        private String transactionId;
    }

    public AccountOperationResponse debitAccount(Long accountNumber, BigDecimal amount, String description) {
        String url = accountServiceUrl + "/api/v1/internal/accounts/debit";
        AccountOperationRequest request = AccountOperationRequest.builder()
                .accountNumber(accountNumber)
                .amount(amount)
                .description(description)
                .build();
        try {
            return restTemplate.postForObject(url, request, AccountOperationResponse.class);
        } catch (Exception e) {
            log.error("Error debiting bank account {} with Account Service: {}", accountNumber, e.getMessage());
            throw new RuntimeException("Account debit failed: " + e.getMessage());
        }
    }
}
