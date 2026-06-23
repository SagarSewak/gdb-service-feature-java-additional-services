package com.gdb.creditcards.controller;

import com.gdb.creditcards.dto.CreditCardDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Collections;

@RestController
@RequestMapping("/api/v1/credit-cards")
public class CreditCardController {

    // Students: Inject your CreditCardService here

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CreditCardDto>> listUserCards(@PathVariable String userId) {
        // Students: Implement logic to fetch user cards
        return ResponseEntity.ok(Collections.emptyList());
    }

    @PostMapping("/apply")
    public ResponseEntity<CreditCardDto> applyForCard(@RequestBody CreditCardDto application) {
        // Students: Implement application validation and card generation
        return ResponseEntity.status(501).build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CreditCardDto> getCardDetails(@PathVariable String id) {
        // Students: Implement logic to fetch card details
        return ResponseEntity.status(501).build();
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<?> getCardTransactions(@PathVariable String id) {
        // Students: Implement logic to fetch transactions
        return ResponseEntity.status(501).build();
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<?> payCreditCardBill(@PathVariable String id, @RequestBody Object payment) {
        // Students: Implement payment processing logic
        return ResponseEntity.status(501).build();
    }
}
