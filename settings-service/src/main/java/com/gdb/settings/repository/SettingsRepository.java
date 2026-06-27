package com.gdb.settings.repository;

import com.gdb.settings.domain.UserSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SettingsRepository extends JpaRepository<UserSettings, String> {
}
