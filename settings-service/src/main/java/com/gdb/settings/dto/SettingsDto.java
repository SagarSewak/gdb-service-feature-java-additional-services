package com.gdb.settings.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class SettingsDto {

    @JsonProperty("login_id")
    private String loginId;

    // General
    @NotBlank
    private String language;

    @NotBlank
    private String timezone;

    @NotBlank
    @JsonProperty("date_format")
    private String dateFormat;

    @NotBlank
    private String currency;

    // Notifications
    @JsonProperty("email_notifications")
    private boolean emailNotifications;

    @JsonProperty("transaction_alerts")
    private boolean transactionAlerts;

    @JsonProperty("login_alerts")
    private boolean loginAlerts;

    @JsonProperty("weekly_reports")
    private boolean weeklyReports;

    @JsonProperty("sms_alerts")
    private boolean smsAlerts;

    @JsonProperty("marketing_emails")
    private boolean marketingEmails;

    // Security
    @JsonProperty("two_factor_enabled")
    private boolean twoFactorEnabled;

    @JsonProperty("session_timeout")
    private int sessionTimeout;

    @JsonProperty("ip_restriction")
    private boolean ipRestriction;

    // Appearance
    @Pattern(regexp = "light|dark|system")
    private String theme;

    @JsonProperty("sidebar_collapsed")
    private boolean sidebarCollapsed;

    @JsonProperty("compact_mode")
    private boolean compactMode;
}
