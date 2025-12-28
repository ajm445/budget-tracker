-- Transactions table for budget-tracker
-- Stores user income and expense transactions

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type = ANY (ARRAY['income'::text, 'expense'::text])),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add comments
COMMENT ON TABLE public.transactions IS '사용자별 수입/지출 거래 내역';
COMMENT ON COLUMN public.transactions.user_id IS '거래를 생성한 사용자 ID';
COMMENT ON COLUMN public.transactions.type IS '거래 유형 (income: 수입, expense: 지출)';
COMMENT ON COLUMN public.transactions.amount IS '거래 금액 (원화)';
COMMENT ON COLUMN public.transactions.category IS '거래 카테고리 (식비, 숙박, 교통 등)';
COMMENT ON COLUMN public.transactions.description IS '거래 설명';
COMMENT ON COLUMN public.transactions.date IS '거래 날짜 (YYYY년 MM월 DD일 형식)';

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
