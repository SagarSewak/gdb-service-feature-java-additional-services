# Credit Card Service - Implementation Plan

We will implement a fully functioning, database-backed Credit Card microservice (`credit-cards-service`) and integrate it with the React frontend.

## 1. Backend Service Scaffold (`credit-cards-service`)

### Maven Configuration (`pom.xml`)
We will create a `pom.xml` containing:
- `spring-boot-starter-web` for HTTP controllers.
- `spring-boot-starter-data-jpa` for repository layer using JPA/Hibernate.
- `postgresql` driver.
- `flyway-core` and `flyway-database-postgresql` for database migrations.
- `lombok` for boilerplates.
- `springdoc-openapi-starter-webmvc-ui` for OpenAPI docs.

### Configuration & Properties (`application.yml`)
Configure database connections and service ports:
- Port: `8009`
- Database URL: `jdbc:postgresql://localhost:5432/gdb_creditcards_db`
- Connection details & Flyway configuration.

### Application Entry Point
Create `CreditCardsServiceApplication.java` under package `com.gdb.creditcards`.

### Security Context
Implement JWT validation via authentication checks against the central `auth-service` (on port `8004`), using the standard codebase pattern:
- `AuthClient.java` (invokes `/internal/v1/auth/validate-token`)
- `SecurityFilter.java` (intercepts requests and verifies bearer tokens)
- `UserContext.java` and `UserContextHolder.java` (ThreadLocal context holding user identity/role)

### Account Integration Client
Implement `AccountServiceClient.java` to make HTTP calls to `account-service` (`/api/v1/internal/accounts/debit`) for processing credit card bill payments from a user's checking/savings account.

---

## 2. Database Migration (`V1__Initial_Schema.sql`)

Create the database tables using Flyway:
1. **`credit_cards`**:
   - `id`: VARCHAR(36) (Primary Key, UUID)
   - `user_id`: BIGINT (User's ID in the system)
   - `card_number`: VARCHAR(30) (Masked or full number)
   - `card_type`: VARCHAR(20) (SILVER, GOLD, PLATINUM)
   - `credit_limit`: NUMERIC(15, 2)
   - `available_credit`: NUMERIC(15, 2)
   - `outstanding_amount`: NUMERIC(15, 2)
   - `minimum_due`: NUMERIC(15, 2)
   - `next_due_date`: DATE
   - `status`: VARCHAR(20) (ACTIVE, BLOCKED)
   - `created_at`, `updated_at`
2. **`credit_card_transactions`**:
   - `id`: VARCHAR(36) (Primary Key, UUID)
   - `card_id`: VARCHAR(36) (Foreign Key references `credit_cards`)
   - `date`: TIMESTAMP
   - `merchant`: VARCHAR(255)
   - `amount`: NUMERIC(15, 2)
   - `type`: VARCHAR(20) (PURCHASE, PAYMENT, REFUND)
   - `status`: VARCHAR(20) (COMPLETED, PENDING)
   - `created_at`

---

## 3. Java Entities & Services

### Entities and DTOs
- `CreditCard.java` (existing JPA Entity)
- `CreditCardTransaction.java` (JPA Entity for tracking transactions)
- `CreditCardDto.java` (existing DTO)
- `CreditCardTransactionDto.java` (DTO for transactions)

### Repositories
- `CreditCardRepository` extending `JpaRepository<CreditCard, String>`
- `CreditCardTransactionRepository` extending `JpaRepository<CreditCardTransaction, String>`

### Service Layer
Define `CreditCardService` and `CreditCardServiceImpl`:
- `List<CreditCardDto> getCardsByUserId(Long userId)`
- `CreditCardDto applyForCard(Long userId, CreditCardDto applicationDto)`
- `List<CreditCardTransactionDto> getTransactions(String cardId, String type, String fromDate, String toDate)`
- `Map<String, Object> payBill(String cardId, Double amount, Long debitAccount)`

---

## 4. Frontend Integration

1. Add backend URL and configure `creditCardsApi` in `frontend/src/services/apiConfig.js`.
2. Add environment variable `VITE_CREDIT_CARDS_SERVICE_URL=http://localhost:8009` to `.env` and `.env.example`.
3. Rewrite `mockCreditCardService.js` (or adjust it) to call the real backend Axios instance instead of returning hardcoded local arrays, retaining the same method signatures so no page-level modifications are needed.
