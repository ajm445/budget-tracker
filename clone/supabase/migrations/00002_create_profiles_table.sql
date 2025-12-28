-- Profiles table for japan-working-holiday-app
-- Stores user profile and app settings

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  provider TEXT CHECK (provider = ANY (ARRAY['google'::text, 'line'::text, 'email'::text])),
  provider_id TEXT,
  settings JSONB DEFAULT '{"theme": "light", "privacy": {"shareStatistics": false}, "language": "ko", "notifications": {"push": false, "email": true}, "defaultCurrency": "KRW"}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  last_sign_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Add comments
COMMENT ON TABLE public.profiles IS '사용자 프로필 및 앱 설정 정보';
COMMENT ON COLUMN public.profiles.id IS 'auth.users.id 외래키';
COMMENT ON COLUMN public.profiles.username IS '사용자 아이디 (이메일 로그인용, 고유값)';
COMMENT ON COLUMN public.profiles.provider IS '로그인 제공자 (google, line, email)';
COMMENT ON COLUMN public.profiles.settings IS '사용자별 앱 설정 (통화, 테마, 언어 등)';

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
