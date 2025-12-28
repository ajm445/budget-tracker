-- RLS Policies for japan-working-holiday-app
-- Row Level Security policies for all tables

-- =============================================
-- PROFILES TABLE POLICIES
-- =============================================

CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users during signup"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);

-- =============================================
-- TRANSACTIONS TABLE POLICIES
-- =============================================

CREATE POLICY "Users can view own transactions"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON public.transactions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON public.transactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- RECURRING EXPENSES TABLE POLICIES
-- =============================================

CREATE POLICY "Users can view their own recurring expenses"
  ON public.recurring_expenses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recurring expenses"
  ON public.recurring_expenses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring expenses"
  ON public.recurring_expenses
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring expenses"
  ON public.recurring_expenses
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- CATEGORY BUDGETS TABLE POLICIES
-- =============================================

CREATE POLICY "Users can view own category budgets"
  ON public.category_budgets
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own category budgets"
  ON public.category_budgets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own category budgets"
  ON public.category_budgets
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own category budgets"
  ON public.category_budgets
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- SAVINGS GOALS TABLE POLICIES
-- =============================================

CREATE POLICY "Users can view their own savings goals"
  ON public.savings_goals
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own savings goals"
  ON public.savings_goals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own savings goals"
  ON public.savings_goals
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own savings goals"
  ON public.savings_goals
  FOR DELETE
  USING (auth.uid() = user_id);
