package com.gdb.settings.domain;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_settings")
@Data
public class UserSettings {

    @Id
    @Column(name = "login_id", length = 50)
    private String loginId;

    // General
    @Column(nullable = false, length = 10)
    private String language = "en";

    @Column(nullable = false, length = 50)
    private String timezone = "Asia/Kolkata";

    @Column(name = "date_format", nullable = false, length = 20)
    private String dateFormat = "DD/MM/YYYY";

    @Column(nullable = false, length = 10)
    private String currency = "INR";

    // Notifications
    @Column(name = "email_notifications", nullable = false)
    private boolean emailNotifications = true;

    @Column(name = "transaction_alerts", nullable = false)
    private boolean transactionAlerts = true;

    @Column(name = "login_alerts", nullable = false)
    private boolean loginAlerts = true;

    @Column(name = "weekly_reports", nullable = false)
    private boolean weeklyReports = true;

    @Column(name = "sms_alerts", nullable = false)
    private boolean smsAlerts = false;

    @Column(name = "marketing_emails", nullable = false)
    private boolean marketingEmails = false;

    // Security
    @Column(name = "two_factor_enabled", nullable = false)
    private boolean twoFactorEnabled = false;

    @Column(name = "session_timeout", nullable = false)
    private int sessionTimeout = 30;

    @Column(name = "ip_restriction", nullable = false)
    private boolean ipRestriction = false;

    // Appearance
    @Column(nullable = false, length = 10)
    private String theme = "light";

    @Column(name = "sidebar_collapsed", nullable = false)
    private boolean sidebarCollapsed = false;

    @Column(name = "compact_mode", nullable = false)
    private boolean compactMode = false;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
