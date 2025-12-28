-- Indexes for japan-working-holiday-app
-- Performance optimization indexes for all tables

-- Profiles indexes
CREATE INDEX idx_profiles_email ON public.profiles USING btree (email);
CREATE INDEX idx_profiles_username ON public.profiles USING btree (username);
CREATE INDEX idx_profiles_provider ON public.profiles USING btree (provider);
CREATE INDEX idx_profiles_created_at ON public.profiles USING btree (created_at DESC);

-- Transactions indexes
CREATE INDEX idx_transactions_user_id ON public.transactions USING btree (user_id);
CREATE INDEX idx_transactions_date ON public.transactions USING btree (date DESC);
CREATE INDEX idx_transactions_type ON public.transactions USING btree (type);
CREATE INDEX idx_transactions_category ON public.transactions USING btree (category);
CREATE INDEX idx_transactions_created_at ON public.transactions USING btree (created_at DESC);
CREATE INDEX idx_transactions_user_date ON public.transactions USING btree (user_id, date DESC);

-- Recurring expenses indexes
CREATE INDEX idx_recurring_expenses_user_id ON public.recurring_expenses USING btree (user_id);
CREATE INDEX idx_recurring_expenses_is_active ON public.recurring_expenses USING btree (is_active);
CREATE INDEX idx_recurring_expenses_user_active ON public.recurring_expenses USING btree (user_id, is_active);

-- Category budgets indexes
CREATE INDEX category_budgets_user_id_idx ON public.category_budgets USING btree (user_id);
CREATE INDEX category_budgets_category_idx ON public.category_budgets USING btree (category);
CREATE INDEX category_budgets_year_month_idx ON public.category_budgets USING btree (year, month);
CREATE INDEX category_budgets_user_year_month_idx ON public.category_budgets USING btree (user_id, year, month);

-- Savings goals indexes
CREATE INDEX idx_savings_goals_user_id ON public.savings_goals USING btree (user_id);
CREATE INDEX idx_savings_goals_deadline ON public.savings_goals USING btree (deadline);
CREATE INDEX idx_savings_goals_is_completed ON public.savings_goals USING btree (is_completed);
