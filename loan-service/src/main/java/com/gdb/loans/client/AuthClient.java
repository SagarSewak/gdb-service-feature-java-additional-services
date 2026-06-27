package com.gdb.loans.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class AuthClient {
    private final RestTemplate restTemplate;

    @Value("${app.services.auth-url:http://localhost:8004}")
    private String authServiceUrl;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class TokenValidationResponse {
        @JsonProperty("valid") private boolean isValid;
        @JsonProperty("user_id") private Long userId;
        @JsonProperty("login_id") private String loginId;
        private String role;
    }

    public TokenValidationResponse validateToken(String token) {
        try {
            return restTemplate.postForObject(
                authServiceUrl + "/internal/v1/auth/validate-token",
                Map.of("token", token),
                TokenValidationResponse.class);
        } catch (Exception e) {
            log.error("Token validation error: {}", e.getMessage());
            return TokenValidationResponse.builder().isValid(false).build();
        }
    }
}
