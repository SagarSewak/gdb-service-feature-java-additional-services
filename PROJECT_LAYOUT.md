# GDB Banking Project Layout

This document provides a technical overview of the directory structure, microservices architecture, frontend application, and configuration scripts of the GDB Banking application.

---

## Directory Overview

The project is structured as a multi-module microservice application comprising a React frontend, multiple Java Spring Boot services, local configuration scripts, and documentation files.

```
.
├── aadhar-service/            # Spring Boot service for Aadhar verification
├── account-service/           # Spring Boot service for user bank accounts
├── auth-service/              # Spring Boot service handling JWT authentication
├── bank-statements-service/   # Spring Boot service for document generation
├── company-service/           # Spring Boot service managing partner corporate clients
├── credit-cards-service/      # Spring Boot service for credit card operations
├── payment-gateway-service/   # Spring Boot service simulating payment operations
├── settings-service/          # Spring Boot service managing system preferences (implemented globally)
├── transactions-service/      # Spring Boot service recording ledger deposits/transfers/withdrawals
├── users-service/             # Spring Boot service managing customer profiles
│
├── frontend/                  # React Single Page Application (Vite, Tailwind CSS, Lucide Icons)
│
├── Implementation of others/  # Subdirectory containing other codebase implementations (e.g. Cloud-Clean)
├── Requirements/              # Project and academic requirements documentation
├── logs/                      # Centralized directory for service runtime logs
│
├── run_all_services.sh        # Script to start all microservices concurrently
├── run_core_services.sh       # Script to start primary microservices
└── Documentation MDs          # Various design, guide, and setup markdown documents
```

---

## 1. Backend Microservices (`/` subdirectories)
Each microservice is an independent Maven project containing its own `pom.xml` and database migration schemas (typically Flyway-based).

- **[auth-service](file:///Users/sagarsewak/Documents/Personal/College/STEP/OFFLINE/gdb-service-feature-java-additional-services/auth-service)**: The gatekeeper service. Issues JWT tokens and validates session states.
- **[users-service](file:///Users/sagarsewak/Documents/Personal/College/STEP/OFFLINE/gdb-service-feature-java-additional-services/users-service)**: Stores user credentials, contact information, and roles.
- **[account-service](file:///Users/sagarsewak/Documents/Personal/College/STEP/OFFLINE/gdb-service-feature-java-additional-services/account-service)**: Handles savings and current accounts lifecycle.
- **[transactions-service](file:///Users/sagarsewak/Documents/Personal/College/STEP/OFFLINE/gdb-service-feature-java-additional-services/transactions-service)**: Records financial ledger events (deposits, withdrawals, and inter-bank transfers).
- **[settings-service](file:///Users/sagarsewak/Documents/Personal/College/STEP/OFFLINE/gdb-service-feature-java-additional-services/settings-service)**: Exposes endpoints for managing global system preferences (theme, language, date format, and notifications). Modified to support a single global entity ("default") irrespective of user profiles.
- **[credit-cards-service](file:///Users/sagarsewak/Documents/Personal/College/STEP/OFFLINE/gdb-service-feature-java-additional-services/credit-cards-service)**: Operations for credit card allocations, balance limits, billing, and statements.
- **[aadhar-service](file:///Users/sagarsewak/Documents/Personal/College/STEP/OFFLINE/gdb-service-feature-java-additional-services/aadhar-service)**: Integrates mock state database for validating KYC/Aadhar numbers.
- **[company-service](file:///Users/sagarsewak/Documents/Personal/College/STEP/OFFLINE/gdb-service-feature-java-additional-services/company-service)**: Coordinates registry checks for corporate banking users.
- **[bank-statements-service](file:///Users/sagarsewak/Documents/Personal/College/STEP/OFFLINE/gdb-service-feature-java-additional-services/bank-statements-service)**: Prepares and compiles downloadable transaction history sheets.
- **[payment-gateway-service](file:///Users/sagarsewak/Documents/Personal/College/STEP/OFFLINE/gdb-service-feature-java-additional-services/payment-gateway-service)**: Mock checkout interface supporting external transaction webhooks.

---

## 2. Frontend Application (`/frontend`)
The front-end is configured as a modern React application.
- **Service Wrappers (`src/services/`)**: Centralized Axios clients configured in `apiConfig.js` map JSON endpoints to localized front-end store utilities.
- **State Management (`src/store/`)**: Utilizes Zustand packages to coordinate persistent storage and active session contexts (e.g. `authStore.js`).
- **Views & Pages (`src/pages/`)**: Includes views for Dashboard analytics, User Profile setup, settings adjustment page (SettingsPage.jsx), Accounts lookup, and Transaction initiation panels.

---

## 3. Shell Orchestration Scripts
- **[run_all_services.sh](file:///Users/sagarsewak/Documents/Personal/College/STEP/OFFLINE/gdb-service-feature-java-additional-services/run_all_services.sh)**: Automates starting PostgreSQL, service registries, and spawning all backend microservice jars concurrently.
- **[run_core_services.sh](file:///Users/sagarsewak/Documents/Personal/College/STEP/OFFLINE/gdb-service-feature-java-additional-services/run_core_services.sh)**: Spawns a lightweight profile configuration omitting optional microservices.

---

## 4. Architectural System Guides
- **[RUN_PROJECT.md](file:///Users/sagarsewak/Documents/Personal/College/STEP/OFFLINE/gdb-service-feature-java-additional-services/RUN_PROJECT.md)**: Startup commands for both local development profiles and database setups.
- **[MICROSERVICES.md](file:///Users/sagarsewak/Documents/Personal/College/STEP/OFFLINE/gdb-service-feature-java-additional-services/MICROSERVICES.md)**: Detailed breakdown of service ports, internal API pathways, and configuration boundaries.
- **[database_installation_guide.md](file:///Users/sagarsewak/Documents/Personal/College/STEP/OFFLINE/gdb-service-feature-java-additional-services/database_installation_guide.md)**: Guides the user through local PostgreSQL setup, pgAdmin configurations, and seed tables initialization.
