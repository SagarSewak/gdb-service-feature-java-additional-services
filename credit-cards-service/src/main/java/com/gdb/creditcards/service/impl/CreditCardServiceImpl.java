package com.gdb.creditcards.service.impl;

import com.gdb.creditcards.client.AccountServiceClient;
import com.gdb.creditcards.domain.CreditCard;
import com.gdb.creditcards.domain.CreditCardTransaction;
import com.gdb.creditcards.dto.CreditCardDto;
import com.gdb.creditcards.dto.CreditCardTransactionDto;
import com.gdb.creditcards.repository.CreditCardRepository;
import com.gdb.creditcards.repository.CreditCardTransactionRepository;
import com.gdb.creditcards.service.CreditCardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class CreditCardServiceImpl implements CreditCardService {

    private final CreditCardRepository creditCardRepository;
    private final CreditCardTransactionRepository creditCardTransactionRepository;
    private final AccountServiceClient accountServiceClient;

    @Override
    public List<CreditCardDto> getCardsByUserId(String userId) {
        log.info("Fetching credit cards for user: {}", userId);
        try {
            Long userLongId = Long.valueOf(userId);
            return creditCardRepository.findByUserId(userLongId).stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        } catch (NumberFormatException e) {
            log.error("Invalid user ID format: {}", userId);
            return Collections.emptyList();
        }
    }

    @Override
    public CreditCardDto getCardById(String cardId) {
        log.info("Fetching credit card by ID: {}", cardId);
        CreditCard card = creditCardRepository.findById(cardId)
                .orElseThrow(() -> new NoSuchElementException("Credit card not found with ID: " + cardId));
        return convertToDto(card);
    }

    @Override
    @Transactional
    public CreditCardDto applyForCard(String userId, CreditCardDto application) {
        log.info("Applying for a new credit card. User: {}, Type: {}", userId, application.getCardType());

        if (application.getCardType() == null || application.getCardType().trim().isEmpty()) {
            throw new IllegalArgumentException("Card type is required");
        }

        if (application.getName() == null || application.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Name is required");
        }

        if (application.getMobileNumber() == null || application.getMobileNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("Mobile number is required");
        }

        // Validate mobile number: P1 - Mobile numbers should be mapped to the credit card
        String mobile = application.getMobileNumber().trim();
        if (!mobile.matches("^[0-9]{10,15}$")) {
            throw new IllegalArgumentException("Mobile number must be between 10 and 15 digits");
        }

        // Validate salary limits based on card type
        String type = application.getCardType().trim();
        Double salary = application.getSalary();
        if (salary == null) {
            throw new IllegalArgumentException("Salary is required for validation");
        }

        BigDecimal limit;
        if (type.equalsIgnoreCase("Platinum")) {
            if (salary < 50000.0) {
                throw new IllegalArgumentException("Platinum tier card requires a salary of at least ₹50,000");
            }
            limit = BigDecimal.valueOf(500000.0);
        } else if (type.equalsIgnoreCase("Gold")) {
            if (salary < 30000.0) {
                throw new IllegalArgumentException("Gold tier card requires a salary of at least ₹30,000");
            }
            limit = BigDecimal.valueOf(250000.0);
        } else {
            if (salary < 15000.0) {
                throw new IllegalArgumentException("Silver tier card requires a salary of at least ₹15,000");
            }
            limit = BigDecimal.valueOf(100000.0);
            type = "Silver"; // Normalise
        }

        // Generate 16 digit number using Luhn's algorithm similar to Amex cards (starts with 37)
        String cardNumber = generateLuhnAmex16();

        // Generate 3 digit CVV
        Random random = new Random();
        String cvv = String.format("%03d", random.nextInt(1000));

        // Generate expiry date in MM/YY format (5 years from now)
        LocalDate expiry = LocalDate.now().plusYears(5);
        String expiryDate = String.format("%02d/%02d", expiry.getMonthValue(), expiry.getYear() % 100);

        CreditCard card = new CreditCard();
        card.setUserId(Long.valueOf(userId));
        card.setCardNumber(cardNumber);
        card.setCardType(type);
        card.setCreditLimit(limit);
        card.setAvailableCredit(limit);
        card.setOutstandingAmount(BigDecimal.ZERO);
        card.setMinimumDue(BigDecimal.ZERO);
        card.setNextDueDate(LocalDate.now().plusDays(30));
        card.setStatus("Active");
        card.setName(application.getName().trim());
        card.setMobileNumber(mobile);
        card.setExpiryDate(expiryDate);
        card.setCvv(cvv);
        
        String nickname = application.getNickname();
        if (nickname == null || nickname.trim().isEmpty()) {
            nickname = type + " Card";
        }
        card.setNickname(nickname.trim());

        CreditCard savedCard = creditCardRepository.save(card);
        log.info("Successfully generated credit card: {}", savedCard.getId());
        return convertToDto(savedCard);
    }

    private String generateLuhnAmex16() {
        Random random = new Random();
        StringBuilder sb = new StringBuilder("37");
        while (sb.length() < 15) {
            sb.append(random.nextInt(10));
        }
        int sum = 0;
        for (int i = 0; i < 15; i++) {
            int digit = Character.getNumericValue(sb.charAt(i));
            if (i % 2 == 0) { // even index left-to-right (0, 2, ..., 14)
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            sum += digit;
        }
        int checkDigit = (10 - (sum % 10)) % 10;
        sb.append(checkDigit);
        return sb.toString();
    }

    @Override
    public List<CreditCardTransactionDto> getTransactions(String cardId, String type, String fromDate, String toDate) {
        log.info("Fetching transactions for card ID: {}", cardId);
        List<CreditCardTransaction> txns = creditCardTransactionRepository.findByCardIdOrderByDateDesc(cardId);

        // Apply filters
        if (type != null && !type.equalsIgnoreCase("All")) {
            txns = txns.stream()
                    .filter(t -> t.getType().equalsIgnoreCase(type))
                    .collect(Collectors.toList());
        }

        if (fromDate != null && !fromDate.trim().isEmpty()) {
            LocalDateTime start = LocalDate.parse(fromDate, DateTimeFormatter.ISO_LOCAL_DATE).atStartOfDay();
            txns = txns.stream()
                    .filter(t -> t.getDate().isAfter(start) || t.getDate().isEqual(start))
                    .collect(Collectors.toList());
        }

        if (toDate != null && !toDate.trim().isEmpty()) {
            LocalDateTime end = LocalDate.parse(toDate, DateTimeFormatter.ISO_LOCAL_DATE).plusDays(1).atStartOfDay();
            txns = txns.stream()
                    .filter(t -> t.getDate().isBefore(end))
                    .collect(Collectors.toList());
        }

        return txns.stream()
                .map(this::convertTxnToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Map<String, Object> payBill(String cardId, Double amount, Long debitAccount) {
        log.info("Paying bill for card {}. Amount: {}, Account: {}", cardId, amount, debitAccount);
        CreditCard card = creditCardRepository.findById(cardId)
                .orElseThrow(() -> new NoSuchElementException("Credit card not found"));

        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }

        BigDecimal amountBigDecimal = BigDecimal.valueOf(amount);

        if (amountBigDecimal.compareTo(card.getOutstandingAmount()) > 0) {
            throw new IllegalArgumentException("Amount cannot exceed outstanding amount");
        }

        // Call Account Service to debit bank account
        log.info("Initiating account debit for bill payment...");
        String desc = "Credit Card Bill Payment - Card " + card.getCardNumber();
        accountServiceClient.debitAccount(debitAccount, amountBigDecimal, desc);

        // Success - update card values
        card.setOutstandingAmount(card.getOutstandingAmount().subtract(amountBigDecimal));
        card.setAvailableCredit(card.getAvailableCredit().add(amountBigDecimal));
        if (card.getOutstandingAmount().compareTo(BigDecimal.ZERO) == 0) {
            card.setMinimumDue(BigDecimal.ZERO);
        }

        creditCardRepository.save(card);

        // Log payment transaction
        CreditCardTransaction transaction = CreditCardTransaction.builder()
                .cardId(cardId)
                .date(LocalDateTime.now())
                .merchant("Credit Card Bill Payment")
                .amount(amountBigDecimal)
                .type("Payment")
                .status("Completed")
                .build();
        CreditCardTransaction savedTxn = creditCardTransactionRepository.save(transaction);

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("transactionId", savedTxn.getId());
        return result;
    }

    @Override
    @Transactional
    public CreditCardTransactionDto createTransaction(String cardId, CreditCardTransactionDto transactionDto) {
        log.info("Creating transaction for card ID: {}, amount: {}", cardId, transactionDto.getAmount());
        CreditCard card = creditCardRepository.findById(cardId)
                .orElseThrow(() -> new NoSuchElementException("Credit card not found with ID: " + cardId));

        if (!"Active".equalsIgnoreCase(card.getStatus())) {
            throw new IllegalStateException("Credit card is not active");
        }

        BigDecimal amount = BigDecimal.valueOf(transactionDto.getAmount());
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Transaction amount must be greater than zero");
        }

        // Validate Limit: "b.3. Transactions cannot be done more than the limit provided - P1"
        if (amount.compareTo(card.getAvailableCredit()) > 0) {
            throw new IllegalArgumentException("Transaction limit exceeded. Available credit is ₹" + card.getAvailableCredit());
        }

        // Deduct available credit and add to outstanding amount
        card.setAvailableCredit(card.getAvailableCredit().subtract(amount));
        card.setOutstandingAmount(card.getOutstandingAmount().add(amount));
        // Minimum due could be updated, let's say 5% of outstanding amount
        card.setMinimumDue(card.getOutstandingAmount().multiply(BigDecimal.valueOf(0.05)));

        creditCardRepository.save(card);

        CreditCardTransaction transaction = CreditCardTransaction.builder()
                .cardId(cardId)
                .date(LocalDateTime.now())
                .merchant(transactionDto.getMerchant() != null ? transactionDto.getMerchant() : "Online Purchase")
                .amount(amount)
                .type(transactionDto.getType() != null ? transactionDto.getType() : "Purchase")
                .status("Completed")
                .build();

        CreditCardTransaction savedTxn = creditCardTransactionRepository.save(transaction);
        return convertTxnToDto(savedTxn);
    }

    private CreditCardDto convertToDto(CreditCard card) {
        CreditCardDto dto = new CreditCardDto();
        dto.setId(card.getId());
        dto.setUserId(card.getUserId() != null ? card.getUserId().toString() : null);
        dto.setCardNumber(card.getCardNumber());
        dto.setCardType(card.getCardType());
        dto.setCreditLimit(card.getCreditLimit() != null ? card.getCreditLimit().doubleValue() : null);
        dto.setAvailableCredit(card.getAvailableCredit() != null ? card.getAvailableCredit().doubleValue() : null);
        dto.setOutstandingAmount(card.getOutstandingAmount() != null ? card.getOutstandingAmount().doubleValue() : null);
        dto.setMinimumDue(card.getMinimumDue() != null ? card.getMinimumDue().doubleValue() : null);
        dto.setNextDueDate(card.getNextDueDate());
        dto.setStatus(card.getStatus());
        dto.setName(card.getName());
        dto.setMobileNumber(card.getMobileNumber());
        dto.setExpiryDate(card.getExpiryDate());
        dto.setCvv(card.getCvv());
        dto.setNickname(card.getNickname());
        return dto;
    }

    private CreditCardTransactionDto convertTxnToDto(CreditCardTransaction txn) {
        return CreditCardTransactionDto.builder()
                .id(txn.getId())
                .cardId(txn.getCardId())
                .date(txn.getDate())
                .merchant(txn.getMerchant())
                .amount(txn.getAmount() != null ? txn.getAmount().doubleValue() : null)
                .type(txn.getType())
                .status(txn.getStatus())
                .build();
    }
}
