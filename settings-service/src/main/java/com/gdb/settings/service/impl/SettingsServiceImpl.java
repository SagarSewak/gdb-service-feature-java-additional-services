package com.gdb.settings.service.impl;

import com.gdb.settings.domain.UserSettings;
import com.gdb.settings.dto.SettingsDto;
import com.gdb.settings.repository.SettingsRepository;
import com.gdb.settings.service.SettingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SettingsServiceImpl implements SettingsService {

    private final SettingsRepository settingsRepository;

    @Override
    public SettingsDto getSettings(String loginId) {
        log.debug("Fetching settings globally (ignoring user: {})", loginId);
        UserSettings settings = settingsRepository.findById("default")
                .orElseGet(() -> createDefaults("default"));
        return toDto(settings);
    }

    @Override
    @Transactional
    public SettingsDto updateSettings(String loginId, SettingsDto dto) {
        log.debug("Updating settings globally (ignoring user: {})", loginId);
        UserSettings settings = settingsRepository.findById("default")
                .orElseGet(() -> createDefaults("default"));
        applyDto(settings, dto);
        return toDto(settingsRepository.save(settings));
    }

    private UserSettings createDefaults(String loginId) {
        UserSettings s = new UserSettings();
        s.setLoginId("default");
        return settingsRepository.save(s);
    }

    private void applyDto(UserSettings s, SettingsDto dto) {
        if (dto.getLanguage() != null)  s.setLanguage(dto.getLanguage());
        if (dto.getTimezone() != null)  s.setTimezone(dto.getTimezone());
        if (dto.getDateFormat() != null) s.setDateFormat(dto.getDateFormat());
        if (dto.getCurrency() != null)  s.setCurrency(dto.getCurrency());

        s.setEmailNotifications(dto.isEmailNotifications());
        s.setTransactionAlerts(dto.isTransactionAlerts());
        s.setLoginAlerts(dto.isLoginAlerts());
        s.setWeeklyReports(dto.isWeeklyReports());
        s.setSmsAlerts(dto.isSmsAlerts());
        s.setMarketingEmails(dto.isMarketingEmails());

        s.setTwoFactorEnabled(dto.isTwoFactorEnabled());
        if (dto.getSessionTimeout() > 0) s.setSessionTimeout(dto.getSessionTimeout());
        s.setIpRestriction(dto.isIpRestriction());

        if (dto.getTheme() != null) s.setTheme(dto.getTheme());
        s.setSidebarCollapsed(dto.isSidebarCollapsed());
        s.setCompactMode(dto.isCompactMode());
    }

    private SettingsDto toDto(UserSettings s) {
        SettingsDto dto = new SettingsDto();
        dto.setLoginId(s.getLoginId());
        dto.setLanguage(s.getLanguage());
        dto.setTimezone(s.getTimezone());
        dto.setDateFormat(s.getDateFormat());
        dto.setCurrency(s.getCurrency());
        dto.setEmailNotifications(s.isEmailNotifications());
        dto.setTransactionAlerts(s.isTransactionAlerts());
        dto.setLoginAlerts(s.isLoginAlerts());
        dto.setWeeklyReports(s.isWeeklyReports());
        dto.setSmsAlerts(s.isSmsAlerts());
        dto.setMarketingEmails(s.isMarketingEmails());
        dto.setTwoFactorEnabled(s.isTwoFactorEnabled());
        dto.setSessionTimeout(s.getSessionTimeout());
        dto.setIpRestriction(s.isIpRestriction());
        dto.setTheme(s.getTheme());
        dto.setSidebarCollapsed(s.isSidebarCollapsed());
        dto.setCompactMode(s.isCompactMode());
        return dto;
    }
}
