-- Recurring expenses table for budget-tracker
-- Stores recurring/fixed expense templates

CREATE TABLE public.recurring_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  category TEXT NOT NULL DEFAULT '기타'::text,
  is_active BOOLEAN NOT NULL DEFAULT true,
  day_of_month INTEGER NOT NULL DEFAULT 1 CHECK (day_of_month >= 1 AND day_of_month <= 31),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add comments
COMMENT ON TABLE public.recurring_expenses IS '사용자별 고정 지출 관리';
COMMENT ON COLUMN public.recurring_expenses.amount IS '고정 지출 금액 (원화)';

-- Enable Row Level Security
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;
