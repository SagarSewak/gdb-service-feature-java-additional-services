# Global Digital Bank (GDB) — Loan System Overview

This document outlines the design, calculations, states, and API specifications for the GDB Loan System.

---

## 1. Loan Types & Interest Rates
GDB supports five structured loan profiles, each configured with specific interest rates:

| Loan Type | Interest Rate (p.a.) | Standard Use Case |
| :--- | :---: | :--- |
| **Personal** | 12.0% | General expenses, medical bills, travel |
| **Home** | 8.5% | House construction, apartment purchases |
| **Car** | 9.0% | Vehicle finance |
| **Business** | 14.0% | Corporate capital expansion, inventory |
| **Education** | 7.5% | Academic fees, study materials |

---

## 2. Equated Monthly Installment (EMI) Calculation
Loan EMIs are calculated using the standard amortization formula:

$$EMI = \frac{P \times r \times (1 + r)^n}{(1 + r)^n - 1}$$

Where:
- $P$ = Principal Loan Amount (Min: ₹10,000 / Max: ₹1,00,00,000)
- $r$ = Monthly interest rate (Annual Rate / 12 / 100)
- $n$ = Tenure in months (Min: 6 months / Max: 360 months)

---

## 3. Loan Application Lifecycle State Machine
A loan application progresses through the following stages:

```mermaid
state-diagram-v2
    [*] --> PENDING : User Submits Form
    PENDING --> APPROVED : Staff Approves
    PENDING --> REJECTED : Staff Rejects
    APPROVED --> ACTIVE : Principal Disbursed
    ACTIVE --> CLOSED : Full Balance Paid
    ACTIVE --> DEFAULTED : Missed Amortizations
    REJECTED --> [*]
    CLOSED --> [*]
```

- **`PENDING`**: Application submitted and awaiting staff verification.
- **`APPROVED`**: Term sheets verified and approved by an Admin/Manager.
- **`REJECTED`**: Application declined.
- **`ACTIVE`**: Principal amount active and EMI repayments are currently being processed.
- **`CLOSED`**: Total principal and accrued interest fully settled.
- **`DEFAULTED`**: Repayment schedules breached or terms violated.

---

## 4. Database Schema Structure
The loan microservice handles data using two tables:

### A. `loans` (Amortization Accounts)
- `id` (bigint, PK): Unique loan ID.
- `login_id` (varchar): Login ID of the applicant.
- `account_number` (varchar): Linked savings/current bank account.
- `loan_type` (varchar): `PERSONAL`, `HOME`, `CAR`, `BUSINESS`, or `EDUCATION`.
- `amount` (numeric): Requested principal balance.
- `interest_rate` (numeric): Percentage per annum.
- `tenure_months` (int): Number of months.
- `emi_amount` (numeric): Monthly repayment obligation.
- `status` (varchar): Active lifecycle stage.
- `purpose` (varchar): Explanation description.
- `applied_date` (timestamp)
- `approved_date` (timestamp)
- `closed_date` (timestamp)
- `total_paid` (numeric): Accumulation of repayment transactions.
- `remarks` (varchar): Officer decision notes.

### B. `loan_repayments` (Repayment Ledger)
- `id` (bigint, PK): Transaction ID.
- `loan_id` (bigint, FK): Reference to the parent loan account.
- `amount` (numeric): Paid installment sum.
- `paid_date` (timestamp)
- `emi_number` (int): Term sequence number.

---

## 5. API Endpoints
All protected endpoints require authorization headers containing valid JWT tokens.

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :---: | :--- |
| **POST** | `/api/v1/loans/apply` | Authenticated | Create a loan application |
| **GET** | `/api/v1/loans/my` | Customer | Fetch my loan applications |
| **GET** | `/api/v1/loans/user/{loginId}` | Staff | Fetch loans of a user |
| **GET** | `/api/v1/loans` | Staff | Fetch all loan entries |
| **GET** | `/api/v1/loans/{id}` | Authenticated | Fetch details of a single loan |
| **PUT** | `/api/v1/loans/{id}/approve` | Staff | Approve a pending application |
| **PUT** | `/api/v1/loans/{id}/reject` | Staff | Reject a pending application |
| **POST** | `/api/v1/loans/{id}/repay` | Customer | Make a repayment |
| **GET** | `/api/v1/loans/{id}/repayments` | Authenticated | Get repayment ledger |
