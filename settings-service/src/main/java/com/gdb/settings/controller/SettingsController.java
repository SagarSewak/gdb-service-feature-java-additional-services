package com.gdb.settings.controller;

import com.gdb.settings.dto.SettingsDto;
import com.gdb.settings.service.SettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
@Tag(name = "Settings", description = "User settings operations")
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping
    @Operation(summary = "Get global settings", description = "Returns the global settings profile")
    public ResponseEntity<SettingsDto> getSettings() {
        log.info("GET global settings");
        return ResponseEntity.ok(settingsService.getSettings("default"));
    }

    @PutMapping
    @Operation(summary = "Update global settings", description = "Updates the global settings profile")
    public ResponseEntity<SettingsDto> updateSettings(@Valid @RequestBody SettingsDto dto) {
        log.info("PUT global settings");
        return ResponseEntity.ok(settingsService.updateSettings("default", dto));
    }

    @GetMapping("/{loginId}")
    @Operation(summary = "Get user settings (delegates to global)", description = "Returns the global settings profile")
    public ResponseEntity<SettingsDto> getSettings(@PathVariable String loginId) {
        log.info("GET settings for loginId: {} (mapping to global)", loginId);
        return ResponseEntity.ok(settingsService.getSettings("default"));
    }

    @PutMapping("/{loginId}")
    @Operation(summary = "Update user settings (delegates to global)", description = "Persists settings globally")
    public ResponseEntity<SettingsDto> updateSettings(
            @PathVariable String loginId,
            @Valid @RequestBody SettingsDto dto) {
        log.info("PUT settings for loginId: {} (mapping to global)", loginId);
        return ResponseEntity.ok(settingsService.updateSettings("default", dto));
    }
}
