-- Functions for japan-working-holiday-app
-- This migration creates all necessary functions used by triggers

-- Function: update_updated_at_column
-- Used by profiles, transactions, savings_goals tables
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Function: handle_updated_at
-- Used by category_budgets table
CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$function$;

-- Function: update_recurring_expenses_updated_at
-- Used by recurring_expenses table
CREATE OR REPLACE FUNCTION public.update_recurring_expenses_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Function: handle_new_user
-- Creates profile when new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, provider, provider_id, last_sign_in_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_app_meta_data->>'provider',
    NEW.raw_user_meta_data->>'sub',
    NEW.last_sign_in_at
  )
  ON CONFLICT (id) DO UPDATE SET
    last_sign_in_at = NEW.last_sign_in_at,
    provider = COALESCE(public.profiles.provider, NEW.raw_app_meta_data->>'provider');

  RETURN NEW;
END;
$function$;

-- Function: handle_user_login
-- Updates last_sign_in_at when user logs in
CREATE OR REPLACE FUNCTION public.handle_user_login()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at THEN
    UPDATE public.profiles
    SET last_sign_in_at = NEW.last_sign_in_at
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$function$;

-- Function: delete_auth_user_on_deactivate
-- Deletes auth user when profile is deactivated
CREATE OR REPLACE FUNCTION public.delete_auth_user_on_deactivate()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.is_active = false AND OLD.is_active = true THEN
    DELETE FROM auth.users WHERE id = NEW.id;
    RAISE NOTICE 'User % has been deleted from auth.users', NEW.id;
  END IF;

  RETURN NEW;
END;
$function$;

-- Function: create_default_recurring_expenses
-- Creates default recurring expense templates for new users
CREATE OR REPLACE FUNCTION public.create_default_recurring_expenses(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.recurring_expenses (user_id, name, amount, currency, amount_in_krw, category, is_active, day_of_month, description)
  VALUES (
    p_user_id,
    '월세',
    0,
    'KRW',
    0,
    '주거',
    false,
    1,
    '매월 월세 지출'
  );

  INSERT INTO public.recurring_expenses (user_id, name, amount, currency, amount_in_krw, category, is_active, day_of_month, description)
  VALUES (
    p_user_id,
    '공과금',
    0,
    'KRW',
    0,
    '공과금',
    false,
    5,
    '전기, 가스, 수도 등 공과금'
  );

  RAISE NOTICE 'Default recurring expenses created for user %', p_user_id;
END;
$function$;

-- Function: handle_new_user_recurring_expenses
-- Trigger function to create default recurring expenses for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_recurring_expenses()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  PERFORM public.create_default_recurring_expenses(NEW.id);
  RETURN NEW;
END;
$function$;
