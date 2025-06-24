-- Finance Control Database Schema
-- Generated for Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE transaction_type AS ENUM ('INCOME', 'EXPENSE');
CREATE TYPE recurrence_type AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY', 'YEARLY');

-- Wallets table
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
  balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table  
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  type transaction_type NOT NULL,
  color VARCHAR(7), -- hex color
  icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  type transaction_type NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  description TEXT,
  due_date DATE NOT NULL,
  is_executed BOOLEAN NOT NULL DEFAULT FALSE,
  executed_at TIMESTAMP WITH TIME ZONE,
  
  -- Recurrence fields
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  recurrence_pattern recurrence_type,
  recurrence_interval INTEGER DEFAULT 1 CHECK (recurrence_interval > 0),
  recurrence_end_date DATE,
  parent_transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  
  -- Grouping fields (for credit card transactions)
  group_id UUID,
  is_group_parent BOOLEAN NOT NULL DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_recurrence CHECK (
    (is_recurring = FALSE) OR 
    (is_recurring = TRUE AND recurrence_pattern IS NOT NULL)
  ),
  CONSTRAINT valid_execution CHECK (
    (is_executed = FALSE AND executed_at IS NULL) OR
    (is_executed = TRUE AND executed_at IS NOT NULL)
  )
);

-- Wallet transfers table
CREATE TABLE wallet_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  to_wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  description TEXT,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT different_wallets CHECK (from_wallet_id != to_wallet_id)
);

-- Indexes for performance
CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_due_date ON transactions(due_date);
CREATE INDEX idx_transactions_is_executed ON transactions(is_executed);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_group_id ON transactions(group_id) WHERE group_id IS NOT NULL;
CREATE INDEX idx_transactions_parent_id ON transactions(parent_transaction_id) WHERE parent_transaction_id IS NOT NULL;
CREATE INDEX idx_categories_type ON categories(type);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_wallets_updated_at 
  BEFORE UPDATE ON wallets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at 
  BEFORE UPDATE ON transactions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) policies will be added here when needed
-- For now, assuming single-user application

-- Insert default categories
INSERT INTO categories (name, type, color, icon) VALUES
-- Income categories
('Salário', 'INCOME', '#22c55e', '💰'),
('Freelance', 'INCOME', '#16a34a', '💻'),
('Investimentos', 'INCOME', '#15803d', '📈'),
('Outros', 'INCOME', '#166534', '💵'),

-- Expense categories  
('Alimentação', 'EXPENSE', '#ef4444', '🍽️'),
('Transporte', 'EXPENSE', '#f97316', '🚗'),
('Moradia', 'EXPENSE', '#eab308', '🏠'),
('Saúde', 'EXPENSE', '#ec4899', '🏥'),
('Educação', 'EXPENSE', '#8b5cf6', '📚'),
('Lazer', 'EXPENSE', '#06b6d4', '🎮'),
('Roupas', 'EXPENSE', '#84cc16', '👕'),
('Outros', 'EXPENSE', '#6b7280', '💸');

-- Insert default wallet
INSERT INTO wallets (name, currency) VALUES 
('Carteira Principal', 'BRL'); 