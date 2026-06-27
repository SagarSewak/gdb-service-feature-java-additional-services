-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
    login_id        VARCHAR(50)  PRIMARY KEY,

    -- General
    language        VARCHAR(10)  NOT NULL DEFAULT 'en',
    timezone        VARCHAR(50)  NOT NULL DEFAULT 'Asia/Kolkata',
    date_format     VARCHAR(20)  NOT NULL DEFAULT 'DD/MM/YYYY',
    currency        VARCHAR(10)  NOT NULL DEFAULT 'INR',

    -- Notifications
    email_notifications  BOOLEAN NOT NULL DEFAULT TRUE,
    transaction_alerts   BOOLEAN NOT NULL DEFAULT TRUE,
    login_alerts         BOOLEAN NOT NULL DEFAULT TRUE,
    weekly_reports       BOOLEAN NOT NULL DEFAULT TRUE,
    sms_alerts           BOOLEAN NOT NULL DEFAULT FALSE,
    marketing_emails     BOOLEAN NOT NULL DEFAULT FALSE,

    -- Security
    two_factor_enabled   BOOLEAN NOT NULL DEFAULT FALSE,
    session_timeout      INT     NOT NULL DEFAULT 30,
    ip_restriction       BOOLEAN NOT NULL DEFAULT FALSE,

    -- Appearance
    theme            VARCHAR(10)  NOT NULL DEFAULT 'light',
    sidebar_collapsed BOOLEAN     NOT NULL DEFAULT FALSE,
    compact_mode      BOOLEAN     NOT NULL DEFAULT FALSE,

    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_theme      CHECK (theme IN ('light', 'dark', 'system')),
    CONSTRAINT chk_language   CHECK (language IN ('en', 'hi', 'ta', 'te')),
    CONSTRAINT chk_currency   CHECK (currency IN ('INR', 'USD', 'EUR', 'GBP')),
    CONSTRAINT chk_timeout    CHECK (session_timeout IN (15, 30, 60, 120))
);

-- Auto-update timestamp on any change
CREATE OR REPLACE FUNCTION update_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_settings_timestamp();
