package com.gdb.aiassistant.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChatRequest {
    @NotBlank(message = "Message is required")
    private String message;

    /** Optional current route for context */
    @JsonProperty("current_route")
    private String currentRoute;

    /** Optional user role for personalised responses */
    private String role;
}
