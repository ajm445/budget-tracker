-- Savings goals table for budget-tracker
-- Stores user savings goals

-- Enable uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

CREATE TABLE public.savings_goals (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0,
  deadline DATE,
  category TEXT,
  description TEXT,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add comments
COMMENT ON TABLE public.savings_goals IS '사용자별 저축 목표 관리';
COMMENT ON COLUMN public.savings_goals.target_amount IS '목표 금액 (원화)';
COMMENT ON COLUMN public.savings_goals.current_amount IS '현재 저축 금액 (원화)';

-- Enable Row Level Security
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
