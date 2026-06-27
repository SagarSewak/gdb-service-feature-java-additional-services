package com.gdb.bankstatements.controller;

import com.gdb.bankstatements.dto.StatementDto;
import com.gdb.bankstatements.service.StatementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/statements")
@RequiredArgsConstructor
public class StatementController {

    private final StatementService statementService;

    @PostMapping("/generate")
    public ResponseEntity<StatementDto> generateStatement(
            @RequestBody StatementDto request) {

        return ResponseEntity.ok(
                statementService.generateStatement(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StatementDto> getStatementStatus(
            @PathVariable String id) {

        return ResponseEntity.ok(
                statementService.getStatementStatus(id));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<String> downloadStatement(
            @PathVariable String id) {

        return ResponseEntity.ok(
                statementService.getDownloadUrl(id));
    }
}
