-- Category budgets table for japan-working-holiday-app
-- Stores monthly budget per category

CREATE TABLE public.category_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  budget_amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KRW'::text CHECK (currency = ANY (ARRAY['KRW'::text, 'USD'::text, 'JPY'::text])),
  budget_amount_in_krw NUMERIC NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),

  CONSTRAINT category_budgets_user_category_year_month_key UNIQUE (user_id, category, year, month)
);

-- Add comments
COMMENT ON TABLE public.category_budgets IS '카테고리별 월별 예산 관리';
COMMENT ON COLUMN public.category_budgets.year IS '예산 적용 년도 (예: 2025)';
COMMENT ON COLUMN public.category_budgets.month IS '예산 적용 월 (1-12)';

-- Enable Row Level Security
ALTER TABLE public.category_budgets ENABLE ROW LEVEL SECURITY;
