-- Triggers for budget-tracker
-- Database triggers for automatic updates and actions

-- =============================================
-- PROFILES TABLE TRIGGERS
-- =============================================

-- Trigger: Update updated_at on profiles update
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Delete auth user when profile is deactivated
CREATE TRIGGER trigger_delete_auth_user_on_deactivate
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION delete_auth_user_on_deactivate();

-- Trigger: Create default recurring expenses for new users
CREATE TRIGGER trigger_new_user_recurring_expenses
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_recurring_expenses();

-- =============================================
-- TRANSACTIONS TABLE TRIGGERS
-- =============================================

-- Trigger: Update updated_at on transactions update
CREATE TRIGGER set_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- RECURRING EXPENSES TABLE TRIGGERS
-- =============================================

-- Trigger: Update updated_at on recurring_expenses update
CREATE TRIGGER trigger_recurring_expenses_updated_at
  BEFORE UPDATE ON public.recurring_expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_recurring_expenses_updated_at();

-- =============================================
-- CATEGORY BUDGETS TABLE TRIGGERS
-- =============================================

-- Trigger: Update updated_at on category_budgets update
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.category_budgets
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- =============================================
-- SAVINGS GOALS TABLE TRIGGERS
-- =============================================

-- Trigger: Update updated_at on savings_goals update
CREATE TRIGGER update_savings_goals_updated_at
  BEFORE UPDATE ON public.savings_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- AUTH SCHEMA TRIGGERS (for reference - these are in auth schema)
-- =============================================

-- Note: The following triggers are on auth.users table and should be
-- created separately as they require access to the auth schema:
--
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION public.handle_new_user();
--
-- CREATE TRIGGER on_auth_user_login
--   AFTER UPDATE ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION public.handle_user_login();
