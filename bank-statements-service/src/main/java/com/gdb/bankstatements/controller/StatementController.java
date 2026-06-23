package com.gdb.bankstatements.controller;

import com.gdb.bankstatements.dto.StatementDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/statements")
public class StatementController {

    // Students: Inject your StatementService here

    @PostMapping("/generate")
    public ResponseEntity<StatementDto> generateStatement(@RequestBody StatementDto request) {
        // Students: Implement background generation logic
        return ResponseEntity.status(501).build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<StatementDto> getStatementStatus(@PathVariable String id) {
        // Students: Implement logic to check statement status
        return ResponseEntity.status(501).build();
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadStatement(@PathVariable String id) {
        // Students: Implement logic to download the file
        return ResponseEntity.status(501).build();
    }
}
