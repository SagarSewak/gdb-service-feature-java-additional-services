-- ======================================================
-- Credit Cards Service - Database Schema Setup
-- ======================================================

-- 1. Create Credit Cards Table
CREATE TABLE IF NOT EXISTS credit_cards (
    id VARCHAR(36) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    card_number VARCHAR(30) UNIQUE NOT NULL,
    card_type VARCHAR(20) NOT NULL,
    credit_limit NUMERIC(15, 2) NOT NULL CHECK (credit_limit >= 0),
    available_credit NUMERIC(15, 2) NOT NULL CHECK (available_credit >= 0),
    outstanding_amount NUMERIC(15, 2) NOT NULL CHECK (outstanding_amount >= 0),
    minimum_due NUMERIC(15, 2) NOT NULL CHECK (minimum_due >= 0),
    next_due_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Credit Card Transactions Table
CREATE TABLE IF NOT EXISTS credit_card_transactions (
    id VARCHAR(36) PRIMARY KEY,
    card_id VARCHAR(36) NOT NULL REFERENCES credit_cards(id) ON DELETE CASCADE,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    merchant VARCHAR(255) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    type VARCHAR(20) NOT NULL, -- Purchase, Payment, Refund
    status VARCHAR(20) NOT NULL DEFAULT 'Completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_credit_cards_user_id ON credit_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_card_transactions_card_id ON credit_card_transactions(card_id);
CREATE INDEX IF NOT EXISTS idx_credit_card_transactions_date ON credit_card_transactions(date);

-- 4. Insert Default Seed Card for Testing
INSERT INTO credit_cards (id, user_id, card_number, card_type, credit_limit, available_credit, outstanding_amount, minimum_due, next_due_date, status)
VALUES ('CARD_1001', 1, '**** **** **** 4589', 'Platinum', 500000.00, 125000.00, 375000.00, 18750.00, CURRENT_DATE + INTERVAL '5 days', 'Active')
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Default Seed Transactions
INSERT INTO credit_card_transactions (id, card_id, date, merchant, amount, type, status)
VALUES 
('TXN10001', 'CARD_1001', CURRENT_TIMESTAMP - INTERVAL '1 day', 'Amazon', 15000.00, 'Purchase', 'Completed'),
('TXN10002', 'CARD_1001', CURRENT_TIMESTAMP - INTERVAL '2 days', 'Swiggy', 450.00, 'Purchase', 'Completed'),
('TXN10003', 'CARD_1001', CURRENT_TIMESTAMP - INTERVAL '3 days', 'Zomato', 850.00, 'Purchase', 'Completed'),
('TXN10004', 'CARD_1001', CURRENT_TIMESTAMP - INTERVAL '4 days', 'Uber', 320.00, 'Purchase', 'Completed'),
('TXN10005', 'CARD_1001', CURRENT_TIMESTAMP - INTERVAL '5 days', 'Credit Card Bill Payment', 5000.00, 'Payment', 'Completed')
ON CONFLICT (id) DO NOTHING;
