package com.gdb.settings.service;

import com.gdb.settings.dto.SettingsDto;

public interface SettingsService {
    SettingsDto getSettings(String loginId);
    SettingsDto updateSettings(String loginId, SettingsDto dto);
}
