package com.gdb.settings.domain;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "user_settings")
@Data
public class Settings {
    
    @Id
    @Column(name = "user_id")
    private String userId;
    
    private String theme = "SYSTEM";
    
    private String language = "en";
    
    @Column(name = "email_notifications")
    private boolean emailNotifications = true;
    
    @Column(name = "sms_notifications")
    private boolean smsNotifications = false;
    
    @Column(name = "two_factor_auth_enabled")
    private boolean twoFactorAuthEnabled = false;
}
