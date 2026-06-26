-- Update schema for credit cards
ALTER TABLE credit_cards ADD COLUMN name VARCHAR(100);
ALTER TABLE credit_cards ADD COLUMN mobile_number VARCHAR(15);
ALTER TABLE credit_cards ADD COLUMN expiry_date VARCHAR(5);
ALTER TABLE credit_cards ADD COLUMN cvv VARCHAR(3);

-- Update seed card CARD_1001 with default values
UPDATE credit_cards
SET name = 'Admin User',
    mobile_number = '9876543210',
    expiry_date = '12/30',
    cvv = '123',
    card_number = '3782822463100052'
WHERE id = 'CARD_1001';
