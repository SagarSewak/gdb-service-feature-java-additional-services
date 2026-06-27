package com.gdb.loans.controller;

import com.gdb.loans.dto.request.LoanApplicationRequest;
import com.gdb.loans.dto.request.LoanDecisionRequest;
import com.gdb.loans.dto.response.LoanResponse;
import com.gdb.loans.dto.response.RepaymentResponse;
import com.gdb.loans.security.UserContextHolder;
import com.gdb.loans.service.LoanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/loans")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;

    /** Apply for a new loan (any authenticated user) */
    @PostMapping("/apply")
    public ResponseEntity<LoanResponse> apply(@Valid @RequestBody LoanApplicationRequest req) {
        String loginId = UserContextHolder.getContext().getLoginId();
        return ResponseEntity.status(201).body(loanService.applyForLoan(loginId, req));
    }

    /** Get all loans for the currently logged-in user */
    @GetMapping("/my")
    public ResponseEntity<List<LoanResponse>> myLoans() {
        String loginId = UserContextHolder.getContext().getLoginId();
        return ResponseEntity.ok(loanService.getLoansByUser(loginId));
    }

    /** Get loans for any user by loginId (admin/manager) */
    @GetMapping("/user/{loginId}")
    public ResponseEntity<List<LoanResponse>> userLoans(@PathVariable String loginId) {
        return ResponseEntity.ok(loanService.getLoansByUser(loginId));
    }

    /** Get all loans (admin/manager) */
    @GetMapping
    public ResponseEntity<List<LoanResponse>> allLoans() {
        return ResponseEntity.ok(loanService.getAllLoans());
    }

    /** Get single loan by ID */
    @GetMapping("/{id}")
    public ResponseEntity<LoanResponse> getLoan(@PathVariable Long id) {
        return ResponseEntity.ok(loanService.getLoanById(id));
    }

    /** Approve a pending loan (admin/manager) */
    @PutMapping("/{id}/approve")
    public ResponseEntity<LoanResponse> approve(@PathVariable Long id, @RequestBody LoanDecisionRequest req) {
        return ResponseEntity.ok(loanService.approveLoan(id, req));
    }

    /** Reject a pending loan (admin/manager) */
    @PutMapping("/{id}/reject")
    public ResponseEntity<LoanResponse> reject(@PathVariable Long id, @RequestBody LoanDecisionRequest req) {
        return ResponseEntity.ok(loanService.rejectLoan(id, req));
    }

    /** Make a repayment on an active loan */
    @PostMapping("/{id}/repay")
    public ResponseEntity<RepaymentResponse> repay(
            @PathVariable Long id,
            @RequestBody Map<String, BigDecimal> body) {
        return ResponseEntity.status(201).body(loanService.makeRepayment(id, body.get("amount")));
    }

    /** Get repayment history for a loan */
    @GetMapping("/{id}/repayments")
    public ResponseEntity<List<RepaymentResponse>> repayments(@PathVariable Long id) {
        return ResponseEntity.ok(loanService.getRepayments(id));
    }
}
