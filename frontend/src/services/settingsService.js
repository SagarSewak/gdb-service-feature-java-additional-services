import { settingsApi } from './apiConfig';

/**
 * Settings Service
 * Handles all settings-related API calls to the backend settings service.
 */

export const settingsService = {
  /**
   * Get settings for a user
   * @param {string} loginId - The user's login ID
   * @returns {Promise<Object>} User settings
   */
  getSettings: async (loginId) => {
    try {
      const response = await settingsApi.get(`/api/v1/settings/${loginId}`);
      const d = response.data || {};
      // Map snake_case backend response to camelCase used in UI
      return {
        loginId: d.login_id || d.loginId,
        language: d.language,
        timezone: d.timezone,
        dateFormat: d.date_format || d.dateFormat,
        currency: d.currency,

        emailNotifications: d.email_notifications ?? d.emailNotifications,
        transactionAlerts: d.transaction_alerts ?? d.transactionAlerts,
        loginAlerts: d.login_alerts ?? d.loginAlerts,
        weeklyReports: d.weekly_reports ?? d.weeklyReports,
        smsAlerts: d.sms_alerts ?? d.smsAlerts,
        marketingEmails: d.marketing_emails ?? d.marketingEmails,

        twoFactorEnabled: d.two_factor_enabled ?? d.twoFactorEnabled,
        sessionTimeout: d.session_timeout !== undefined ? String(d.session_timeout) : (d.sessionTimeout !== undefined ? String(d.sessionTimeout) : undefined),
        ipRestriction: d.ip_restriction ?? d.ipRestriction,

        theme: d.theme,
        sidebarCollapsed: d.sidebar_collapsed ?? d.sidebarCollapsed,
        compactMode: d.compact_mode ?? d.compactMode,
      };
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  },

  /**
   * Update settings for a user
   * @param {string} loginId - The user's login ID
   * @param {Object} settings - Settings object to update
   * @returns {Promise<Object>} Updated settings
   */
  updateSettings: async (loginId, settings) => {
    try {
      // Convert UI camelCase settings to backend snake_case DTO
      const payload = {
        login_id: loginId,
        language: settings.language,
        timezone: settings.timezone,
        date_format: settings.dateFormat,
        currency: settings.currency,

        email_notifications: settings.emailNotifications,
        transaction_alerts: settings.transactionAlerts,
        login_alerts: settings.loginAlerts,
        weekly_reports: settings.weeklyReports,
        sms_alerts: settings.smsAlerts,
        marketing_emails: settings.marketingEmails,

        two_factor_enabled: settings.twoFactorEnabled,
        session_timeout: settings.sessionTimeout ? parseInt(settings.sessionTimeout, 10) : undefined,
        ip_restriction: settings.ipRestriction,

        theme: settings.theme,
        sidebar_collapsed: settings.sidebarCollapsed,
        compact_mode: settings.compactMode,
      };

      const response = await settingsApi.put(`/api/v1/settings/${loginId}`, payload);
      const d = response.data || {};
      // return normalized camelCase DTO
      return {
        loginId: d.login_id || d.loginId,
        language: d.language,
        timezone: d.timezone,
        dateFormat: d.date_format || d.dateFormat,
        currency: d.currency,

        emailNotifications: d.email_notifications ?? d.emailNotifications,
        transactionAlerts: d.transaction_alerts ?? d.transactionAlerts,
        loginAlerts: d.login_alerts ?? d.loginAlerts,
        weeklyReports: d.weekly_reports ?? d.weeklyReports,
        smsAlerts: d.sms_alerts ?? d.smsAlerts,
        marketingEmails: d.marketing_emails ?? d.marketingEmails,

        twoFactorEnabled: d.two_factor_enabled ?? d.twoFactorEnabled,
        sessionTimeout: d.session_timeout !== undefined ? String(d.session_timeout) : (d.sessionTimeout !== undefined ? String(d.sessionTimeout) : undefined),
        ipRestriction: d.ip_restriction ?? d.ipRestriction,

        theme: d.theme,
        sidebarCollapsed: d.sidebar_collapsed ?? d.sidebarCollapsed,
        compactMode: d.compact_mode ?? d.compactMode,
      };
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  },
};

export default settingsService;
