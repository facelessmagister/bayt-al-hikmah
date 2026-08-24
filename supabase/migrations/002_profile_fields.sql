-- Add profile fields for certificates and prize transfers
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS second_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age INTEGER CHECK (age BETWEEN 0 AND 120);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_account_number TEXT;
