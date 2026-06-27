package com.gdb.aiassistant.service;

import com.gdb.aiassistant.client.ClaudeClient;
import com.gdb.aiassistant.dto.ChatRequest;
import com.gdb.aiassistant.dto.ChatResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class AssistantService {

    private final ClaudeClient claudeClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Fallback rule-based navigation for when Claude is unavailable
    private static final Map<Pattern, String[]> RULES = new HashMap<>();

    static {
        // Pattern → [route, routeLabel, message]
        RULES.put(Pattern.compile("(?i).*(dashboard|home|main|overview).*"), new String[]{"/dashboard", "Dashboard", "Taking you to the Dashboard!"});
        RULES.put(Pattern.compile("(?i).*(account|accounts).*(list|view|show|see|all).*"), new String[]{"/accounts", "Accounts", "Here are all accounts."});
        RULES.put(Pattern.compile("(?i).*(savings|save).*(account|open|create|new).*"), new String[]{"/accounts/create-savings", "Create Savings Account", "Let's open a savings account."});
        RULES.put(Pattern.compile("(?i).*(current|business).*(account|open|create|new).*"), new String[]{"/accounts/create-current", "Create Current Account", "Let's open a current account."});
        RULES.put(Pattern.compile("(?i).*(deposit|add money|put money|credit).*"), new String[]{"/transactions/deposit", "Deposit Money", "Let's make a deposit."});
        RULES.put(Pattern.compile("(?i).*(withdraw|take out|debit).*"), new String[]{"/transactions/withdraw", "Withdraw Money", "Let's withdraw money."});
        RULES.put(Pattern.compile("(?i).*(transfer|send money|wire).*"), new String[]{"/transactions/transfer", "Transfer Money", "Let's transfer money."});
        RULES.put(Pattern.compile("(?i).*(transaction|history|ledger|statement detail).*"), new String[]{"/transactions", "Transactions", "Here is your transaction history."});
        RULES.put(Pattern.compile("(?i).*(loan|borrow|emi|lend|borrow).*(apply|new|get|take|want|need).*"), new String[]{"/loans/apply", "Apply for Loan", "Let's apply for a loan!"});
        RULES.put(Pattern.compile("(?i).*(my loan|loan status|loan detail|repay|repayment).*"), new String[]{"/loans", "My Loans", "Here are your loans."});
        RULES.put(Pattern.compile("(?i).*(manage loan|approve loan|all loan|loan admin).*"), new String[]{"/loans/manage", "Loan Management", "Opening loan management."});
        RULES.put(Pattern.compile("(?i).*(credit card|card).*"), new String[]{"/credit-cards", "Credit Cards", "Here are your credit cards."});
        RULES.put(Pattern.compile("(?i).*(statement|pdf|download).*"), new String[]{"/statements", "Bank Statements", "Let's generate a statement."});
        RULES.put(Pattern.compile("(?i).*(report|analytics|insight|chart).*"), new String[]{"/reports", "Reports", "Opening reports and analytics."});
        RULES.put(Pattern.compile("(?i).*(setting|preference|profile|password|theme|currency|appearance).*"), new String[]{"/settings", "Settings", "Opening your settings."});
        RULES.put(Pattern.compile("(?i).*(user|customer|staff|teller|manage user).*"), new String[]{"/users", "Users", "Opening user management."});
        RULES.put(Pattern.compile("(?i).*(limit|daily limit|transfer limit).*"), new String[]{"/transactions/daily-limits", "Daily Transfer Limits", "Opening transfer limits."});
        RULES.put(Pattern.compile("(?i).*(loan|borrow).*"), new String[]{"/loans", "My Loans", "Showing your loans."});
        RULES.put(Pattern.compile("(?i).*(account).*"), new String[]{"/accounts", "Accounts", "Showing accounts."});
    }

    public ChatResponse chat(ChatRequest request) {
        // 1. Try Claude
        String raw = claudeClient.chat(request.getMessage());
        if (raw != null) {
            try {
                // Strip markdown code fences if present
                String cleaned = raw.replaceAll("```json", "").replaceAll("```", "").trim();
                JsonNode node = objectMapper.readTree(cleaned);
                return ChatResponse.builder()
                    .message(node.path("message").asText("How can I help you?"))
                    .action(node.path("action").asText("answer"))
                    .route(node.path("route").isNull() ? null : node.path("route").asText())
                    .routeLabel(node.path("route_label").isNull() ? null : node.path("route_label").asText())
                    .aiGenerated(true)
                    .build();
            } catch (Exception e) {
                log.warn("Failed to parse Claude response, falling back: {}", e.getMessage());
            }
        }

        // 2. Fallback: rule-based pattern matching
        for (Map.Entry<Pattern, String[]> entry : RULES.entrySet()) {
            if (entry.getKey().matcher(request.getMessage()).matches()) {
                String[] v = entry.getValue();
                return ChatResponse.builder()
                    .message(v[2]).action("navigate").route(v[0]).routeLabel(v[1]).aiGenerated(false).build();
            }
        }

        return ChatResponse.builder()
            .message("I can help you navigate the banking portal. Try asking to 'deposit money', 'apply for a loan', 'view transactions', or 'open settings'.")
            .action("answer").route(null).routeLabel(null).aiGenerated(false)
            .build();
    }
}
