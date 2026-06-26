-- Add nickname field to credit cards
ALTER TABLE credit_cards ADD COLUMN nickname VARCHAR(100);

-- Update seed card with a default nickname
UPDATE credit_cards
SET nickname = 'Primary Platinum Card'
WHERE id = 'CARD_1001';
