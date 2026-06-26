-- Add pin field to credit cards
ALTER TABLE credit_cards ADD COLUMN pin VARCHAR(4);

-- Set default pin for testing card
UPDATE credit_cards
SET pin = '1234'
WHERE id = 'CARD_1001';
