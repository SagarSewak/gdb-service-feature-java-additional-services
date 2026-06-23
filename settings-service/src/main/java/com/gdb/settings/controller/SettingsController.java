package com.gdb.settings.controller;

import com.gdb.settings.dto.SettingsDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/settings")
public class SettingsController {

    // Students: Inject your SettingsService here

    @GetMapping("/{userId}")
    public ResponseEntity<SettingsDto> getSettings(@PathVariable String userId) {
        // Students: Implement logic to fetch settings
        return ResponseEntity.status(501).build();
    }

    @PutMapping("/{userId}")
    public ResponseEntity<SettingsDto> updateSettings(@PathVariable String userId, @RequestBody SettingsDto settingsDto) {
        // Students: Implement logic to update settings
        return ResponseEntity.status(501).build();
    }
}
