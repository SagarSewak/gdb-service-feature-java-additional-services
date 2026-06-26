package com.gdb.creditcards.controller;

import com.gdb.creditcards.dto.CreditCardDto;
import com.gdb.creditcards.dto.CreditCardTransactionDto;
import com.gdb.creditcards.security.UserContextHolder;
import com.gdb.creditcards.service.CreditCardService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/credit-cards")
@RequiredArgsConstructor
public class CreditCardController {

    private final CreditCardService creditCardService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CreditCardDto>> listUserCards(@PathVariable String userId) {
        return ResponseEntity.ok(creditCardService.getCardsByUserId(userId));
    }

    @PostMapping("/apply")
    public ResponseEntity<CreditCardDto> applyForCard(@RequestBody CreditCardDto application) {
        String userId = UserContextHolder.getContext().getUserId().toString();
        CreditCardDto card = creditCardService.applyForCard(userId, application);
        return ResponseEntity.ok(card);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CreditCardDto> getCardDetails(@PathVariable String id) {
        return ResponseEntity.ok(creditCardService.getCardById(id));
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<CreditCardTransactionDto>> getCardTransactions(
            @PathVariable String id,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {
        return ResponseEntity.ok(creditCardService.getTransactions(id, type, fromDate, toDate));
    }

    @PostMapping("/{id}/transactions")
    public ResponseEntity<CreditCardTransactionDto> createTransaction(
            @PathVariable String id,
            @RequestBody CreditCardTransactionDto transactionDto) {
        return ResponseEntity.ok(creditCardService.createTransaction(id, transactionDto));
    }

    @Data
    public static class BillPaymentRequest {
        private Double amount;
        private Long debitAccount;
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<Map<String, Object>> payCreditCardBill(
            @PathVariable String id,
            @RequestBody BillPaymentRequest payment) {
        Map<String, Object> response = creditCardService.payBill(id, payment.getAmount(), payment.getDebitAccount());
        return ResponseEntity.ok(response);
    }
}
