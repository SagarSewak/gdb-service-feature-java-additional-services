package com.gdb.aiassistant.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@Slf4j
public class ClaudeClient {

    @Value("${app.claude.api-key:}")
    private String apiKey;

    @Value("${app.claude.api-url:https://api.anthropic.com/v1/messages}")
    private String apiUrl;

    @Value("${app.claude.model:claude-haiku-4-5-20251001}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    private static final String SYSTEM_PROMPT = """
You are a banking navigation assistant for GDB (Good Day Bank). \\
Your job is to understand what the user wants and tell them which page to go to.

Available pages and their routes:
- Dashboard: /dashboard
- Accounts (view all): /accounts
- Create Savings Account: /accounts/create-savings
- Create Current Account: /accounts/create-current
- Transactions (history): /transactions
- Deposit Money: /transactions/deposit
- Withdraw Money: /transactions/withdraw
- Transfer Money: /transactions/transfer
- Loans (my loans): /loans
- Apply for Loan: /loans/apply
- Loan Management (admin): /loans/manage
- Credit Cards: /credit-cards
- Bank Statements: /statements
- Reports: /reports
- Settings: /settings
- Users Management: /users
- Daily Transfer Limits: /transactions/daily-limits

Respond ONLY with a JSON object in this exact format (no markdown, no explanation):
{
  "message": "friendly one-sentence response",
  "action": "navigate" or "answer",
  "route": "/the-route" or null,
  "route_label": "Page Name" or null
}

If the user asks something that doesn't require navigation (like "what is my balance" — which you can't answer), \\
set action to "answer" and route to null and explain briefly.
""";

    public String chat(String userMessage) {
        if (apiKey == null || apiKey.isBlank()) {
            return null; // signal to use fallback
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", apiKey);
            headers.set("anthropic-version", "2023-06-01");

            ObjectNode body = mapper.createObjectNode();
            body.put("model", model);
            body.put("max_tokens", 256);
            body.put("system", SYSTEM_PROMPT);

            ArrayNode messages = mapper.createArrayNode();
            ObjectNode msg = mapper.createObjectNode();
            msg.put("role", "user");
            msg.put("content", userMessage);
            messages.add(msg);
            body.set("messages", messages);

            HttpEntity<String> entity = new HttpEntity<>(mapper.writeValueAsString(body), headers);
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, entity, String.class);

            JsonNode root = mapper.readTree(response.getBody());
            return root.path("content").get(0).path("text").asText();
        } catch (Exception e) {
            log.error("Claude API call failed: {}", e.getMessage());
            return null;
        }
    }
}
