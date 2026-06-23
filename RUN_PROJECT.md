# Running the Global Digital Bank (GDB) Microservices Project

This guide explains how to compile, configure, and run the GDB backend microservices and React frontend.

---

## 1. Prerequisites

1. **Java Development Kit (JDK 17)**: Ensure JDK 17 is installed.
2. **Node.js (v18+)**: Ensure Node.js and `npm` are installed.
3. **PostgreSQL**: Ensure PostgreSQL is running on port `5432` with username `postgres` and password `java`.
4. **Databases**: Create the following databases in PostgreSQL:
   - `gdb_users_db`
   - `gdb_auth_db`
   - `gdb_accounts_db`
   - `gdb_transactions_db`

---

## 2. Running the Backend Services

To run the system correctly, start the services in the following order. Open a new terminal window/tab for each service.

### Step 1: Start Eureka Discovery Server (Port 8761)
```bash
cd eureka-server
mvn clean install -DskipTests
mvn spring-boot:run
```

### Step 2: Start Configured Core Microservices
Once Eureka is up, start the remaining backend services:

```bash
# 1. Start Auth Service (Port 8004)
cd auth-service
mvn clean install -DskipTests
mvn spring-boot:run

# 2. Start Users Service (Port 8003)
cd users-service
mvn clean install -DskipTests
mvn spring-boot:run

# 3. Start Aadhar Verification Service (Port 8005)
cd aadhar-service
mvn clean install -DskipTests
mvn spring-boot:run

# 4. Start Account Service (Port 8001)
cd account-service
mvn clean install -DskipTests
mvn spring-boot:run

# 5. Start Transactions Service (Port 8002)
cd transactions-service
mvn clean install -DskipTests
mvn spring-boot:run

# 6. Start Company Service (Port 8006)
cd company-service
mvn clean install -DskipTests
mvn spring-boot:run

# 7. Start Payment Gateway Service (Port 8009)
cd payment-gateway-service
mvn clean install -DskipTests
mvn spring-boot:run
```

### Step 3: Start Gateway Service (Port 8080)
```bash
cd gateway-service
mvn clean install -DskipTests
mvn spring-boot:run
```

---

## 3. Running the React Frontend

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Copy the environment template file:
   ```bash
   cp .env.example .env
   ```
3. Install node dependencies:
   ```bash
   npm install
   ```
4. Run the frontend application:
   ```bash
   npm run dev
   ```
5. Access the application in your browser at `http://localhost:3000`.

---

## 4. Default Seeded Credentials

Use the following credentials to log in:

| Role | Username | Password |
| :--- | :--- | :--- |
| **Admin** | `admin` | `password` |
| **Manager** | `manager` | `password` |
| **Teller** | `teller` | `password` |
