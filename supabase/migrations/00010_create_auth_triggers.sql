-- Auth schema triggers for budget-tracker
-- These triggers handle automatic profile creation and login tracking

-- Trigger: Create profile when new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Update last_sign_in_at when user logs in
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_login();
