# Budget Tracker - 개인 재무 관리 애플리케이션

> React + React Native + TypeScript + Supabase 기반의 개인 재무 관리 웹 & 모바일 애플리케이션

[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react)](https://react.dev/)
[![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK_54-000020?logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.75.1-3ECF8E?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-9.0.0-F69220?logo=pnpm)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.0.0-EF4444?logo=turborepo)](https://turbo.build/)

## 📋 목차

- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [시작하기](#시작하기)
- [앱 실행하기](#앱-실행하기)
- [환경 변수 설정](#환경-변수-설정)
- [개발](#개발)
- [빌드 및 배포](#빌드-및-배포)
- [프로젝트 구조](#프로젝트-구조)
- [라이선스](#라이선스)

## ✨ 주요 기능

### 인증 시스템
- **이메일/비밀번호 로그인** - Supabase Auth 기반 안전한 인증
- **Google OAuth 로그인** - 간편한 소셜 로그인
- **선택적 로그인** - 비로그인 사용자를 위한 임시 데이터 저장 (LocalStorage)
- **계정 관리** - 프로필 수정 및 계정 삭제 기능

### 거래 내역 관리
- **거래 추가/수정/삭제** - 수입/지출 관리
- **다중 통화 지원** - KRW, USD, JPY 지원 및 실시간 환율 변환
- **실시간 환율 API** - exchangerate-api.com 기반 자동 환율 적용
- **카테고리 관리** - 식비, 교통비, 주거비, 쇼핑, 취미, 교육, 의료, 기타 등 8개 카테고리
- **실시간 동기화** - Supabase Realtime으로 즉시 반영
- **모달 기반 UI** - 직관적인 거래 입력 및 수정

### 고정지출 관리
- **고정지출 등록** - 매월 반복되는 지출 자동 관리
- **날짜 기반 관리** - 매월 특정 일자에 발생하는 지출 설정
- **활성화/비활성화** - 고정지출 일시 정지 기능
- **실제 발생 시점 기준 적용** - 생성일 이후이고 실제 발생한 날짜만 통계/캘린더에 반영
- **예상 금액 확인** - 고정지출 탭에서 이번 달 전체 예상 금액 확인 가능
- **다중 통화 지원** - 고정지출도 통화별 관리 가능

### 카테고리 예산 관리
- **월별 독립 예산 관리** - 각 달마다 다른 예산 설정 가능
- **예산 히스토리** - 과거 예산 기록 조회 및 비교
- **전월 복사 기능** - 이전 달 예산을 현재 달로 간편하게 복사
- **예산 초과 알림** - 예산 대비 지출 비율 실시간 표시
- **통계 연동** - 카테고리별 지출 분포에 예산 비교 표시
- **시각적 피드백** - 예산 초과 시 색상 변경 및 경고 표시
- **비로그인 지원** - localStorage 기반 월별 예산 관리

### 저축 목표 관리
- **목표 설정** - 저축 목표 금액 및 기한 설정
- **진행률 추적** - 현재 저축 금액 대비 목표 달성률 표시
- **카테고리 분류** - 저축 목표별 카테고리 지정
- **완료 상태 관리** - 목표 달성 시 완료 처리

### 대시보드 및 통계
- **5가지 뷰 모드**
  - 📊 요약: 월별 수입/지출/잔액 카드
  - 📅 캘린더: 일별 거래 내역 달력 형식 표시
  - 💳 고정지출: 고정지출 및 카테고리 예산 관리
  - 🎯 저축목표: 저축 목표 관리
  - 📈 통계: 상세 분석 및 차트

- **통계 분석**
  - **월별 분석**: 특정 년/월 선택하여 상세 분석
  - **기간별 분석**: 1개월, 3개월, 6개월, 1년, 전체 기간
  - **카테고리별 지출 분포**: 파이 차트 및 상세 내역
  - **예산 대비 분석**: 카테고리별 예산 사용률 표시
  - **주요 인사이트**: 최다 지출 카테고리, 최다 지출일 등

- **캘린더 기능**
  - 일별 수입/지출 합계 표시 (실제 발생한 금액만)
  - 고정지출 날짜 "고정" 배지 표시 (발생일 이후만)
  - 날짜 클릭으로 상세 내역 모달 확인
  - 미래 고정지출은 표시하지 않아 혼란 방지
  - 월별 네비게이션
  - 반응형 디자인 (모바일/태블릿/데스크톱)

### 통화 관리
- **실시간 환율 변환** - 모든 금액 자동 변환
- **통화 선택기** - KRW, USD, JPY 간 즉시 전환
- **일관된 표시** - 모든 화면에서 선택한 통화로 표시
- **원화 기준 저장** - 데이터는 KRW로 저장하여 일관성 유지

### 사용자 경험
- **반응형 디자인** - 모바일/태블릿/데스크톱 최적화
- **다크 모드 지원** - 시스템 설정 연동 다크/라이트 테마
- **빠른 로딩** - Vite 기반 최적화된 번들링 및 코드 스플리팅
- **접근성** - ARIA 라벨 및 키보드 네비게이션
- **Toast 알림** - 사용자 액션에 대한 즉각적인 피드백

### 추가 기능
- **초기 비용 계산기** - 해외 이주 시 초기 비용 예측 도구
- **약관 및 정책** - 서비스 약관 및 개인정보 처리방침
- **테스트 커버리지** - Vitest 및 Playwright 기반 테스트

## 🛠 기술 스택

### 모노레포 구조
- **pnpm Workspaces** - 패키지 관리
- **Turborepo** - 빌드 시스템 및 캐싱

### Web (apps/web)
- **React 19.1.1** - UI 라이브러리
- **TypeScript 5.8.3** - 타입 안전성
- **Vite 7.1.7** - 빌드 도구 및 개발 서버
- **React Router 7.9.4** - 라우팅
- **Tailwind CSS 3.3.0** - 유틸리티 기반 스타일링
- **Recharts 3.2.1** - 데이터 시각화 (차트)
- **Lucide React** - 아이콘 라이브러리
- **React Hot Toast** - 알림 시스템

### Mobile (apps/mobile)
- **React Native 0.81.5** - 크로스 플랫폼 모바일
- **Expo SDK 54** - React Native 개발 플랫폼
- **Expo Router 6.x** - 파일 기반 라우팅
- **NativeWind 4.0** - Tailwind CSS for React Native
- **Victory Native** - 모바일 차트 라이브러리
- **React Native Reanimated** - 애니메이션

### Shared (packages/shared)
- **TypeScript 타입 정의** - 웹/모바일 공유 타입
- **유틸리티 함수** - 계산, 날짜 처리 등

### Backend & Database
- **Supabase** - BaaS (Backend as a Service)
  - PostgreSQL 데이터베이스
  - 실시간 구독 (Realtime)
  - 인증 (Auth)
  - Row Level Security (RLS)

### 개발 도구
- **ESLint** - 코드 품질 관리
- **Prettier** - 코드 포맷팅
- **TypeScript ESLint** - TypeScript 린팅
- **Vitest** - 단위 테스트
- **Playwright** - E2E 테스트
- **Rollup Visualizer** - 번들 분석

### 분석 및 최적화
- **Google Analytics 4** - 사용자 행동 분석
- **Vite Compression** - Gzip 압축
- **Terser** - 코드 최소화

## 🚀 시작하기

### 사전 요구사항

- **Node.js** 18.0.0 이상
- **pnpm** 9.0.0 이상
- **Supabase 계정** (무료 계정 가능)
- **Expo Go 앱** (모바일 테스트용, SDK 54)

### 설치

1. **저장소 클론**
   ```bash
   git clone <repository-url>
   cd budget-tracker
   ```

2. **pnpm 설치** (없는 경우)
   ```bash
   npm install -g pnpm
   ```

3. **의존성 설치**
   ```bash
   pnpm install
   ```

4. **환경 변수 설정**
   ```bash
   # 루트 환경 변수 (웹용)
   cp .env.example .env

   # 모바일 환경 변수
   cp apps/mobile/.env.example apps/mobile/.env
   ```

   `.env` 파일들을 열고 실제 값으로 변경:
   ```env
   # 웹 (.env)
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   VITE_APP_ENV=development

   # 모바일 (apps/mobile/.env)
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

## 📱 앱 실행하기

### 웹 앱 실행

```bash
# 루트 디렉토리에서
pnpm dev:web

# 또는 apps/web 디렉토리에서
cd apps/web
pnpm dev
```

브라우저에서 `http://localhost:5173` 접속

### 모바일 앱 실행

```bash
# 루트 디렉토리에서
pnpm dev:mobile

# 또는 apps/mobile 디렉토리에서
cd apps/mobile
node ../../node_modules/expo/bin/cli start --tunnel --clear
```

Expo Go 앱에서 QR 코드 스캔하여 접속

### 전체 앱 동시 실행

```bash
pnpm dev
```

### 사용 가능한 루트 명령어

| 명령어 | 설명 |
|--------|------|
| `pnpm dev` | 모든 앱 동시 실행 |
| `pnpm dev:web` | 웹 앱만 실행 |
| `pnpm dev:mobile` | 모바일 앱만 실행 |
| `pnpm build` | 모든 앱 빌드 |
| `pnpm build:web` | 웹 앱만 빌드 |
| `pnpm lint` | 모든 앱 린팅 |
| `pnpm typecheck` | 타입 검사 |
| `pnpm clean` | 캐시 및 빌드 정리 |
| `pnpm format` | 코드 포맷팅 |

## 🔐 환경 변수 설정

### 필수 환경 변수

#### 웹 앱 (.env)
| 변수명 | 설명 | 예시 |
|--------|------|------|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL | `https://abcdefg.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Anon/Public Key | `eyJhbGc...` |
| `VITE_APP_ENV` | 앱 환경 | `development` / `production` |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics ID (선택) | `G-XXXXXXXXXX` |

#### 모바일 앱 (apps/mobile/.env)
| 변수명 | 설명 | 예시 |
|--------|------|------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | `https://abcdefg.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon/Public Key | `eyJhbGc...` |

### Supabase 설정 방법

1. [Supabase](https://supabase.com/) 로그인
2. 새 프로젝트 생성
3. **Settings** > **API**에서 다음 정보 복사:
   - **Project URL** → `VITE_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### 데이터베이스 스키마 설정

이 프로젝트는 `supabase/migrations/` 폴더에 마이그레이션 파일이 준비되어 있습니다.
Supabase MCP 또는 Supabase CLI를 사용하여 마이그레이션을 적용하세요.

**마이그레이션 파일 목록:**
1. `00001_create_functions.sql` - 트리거용 함수들
2. `00002_create_profiles_table.sql` - 사용자 프로필 테이블
3. `00003_create_transactions_table.sql` - 거래 내역 테이블
4. `00004_create_recurring_expenses_table.sql` - 고정지출 테이블
5. `00005_create_category_budgets_table.sql` - 카테고리 예산 테이블
6. `00006_create_savings_goals_table.sql` - 저축 목표 테이블
7. `00007_create_indexes.sql` - 성능 최적화 인덱스
8. `00008_create_rls_policies.sql` - Row Level Security 정책
9. `00009_create_triggers.sql` - 자동 업데이트 트리거

**테이블 구조:**

```sql
-- profiles 테이블 (사용자 프로필)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  provider TEXT CHECK (provider IN ('google', 'line', 'email')),
  provider_id TEXT,
  settings JSONB DEFAULT '{"theme": "light", "language": "ko", ...}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  last_sign_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- transactions 테이블 (거래 내역)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- recurring_expenses 테이블 (고정지출)
CREATE TABLE recurring_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  category TEXT NOT NULL DEFAULT '기타',
  is_active BOOLEAN NOT NULL DEFAULT true,
  day_of_month INTEGER NOT NULL DEFAULT 1 CHECK (day_of_month >= 1 AND day_of_month <= 31),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- category_budgets 테이블 (카테고리별 월별 예산)
CREATE TABLE category_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  budget_amount NUMERIC NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, category, year, month)
);

-- savings_goals 테이블 (저축 목표)
CREATE TABLE savings_goals (
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
```

모든 테이블에는 RLS(Row Level Security)가 활성화되어 있으며, 사용자는 자신의 데이터만 조회/수정/삭제할 수 있습니다

## 💻 개발

### 웹 앱 명령어 (apps/web)

```bash
cd apps/web

# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 빌드 결과 미리보기
pnpm preview

# 단위 테스트 실행
pnpm test

# 테스트 UI
pnpm test:ui

# 테스트 커버리지
pnpm test:coverage

# E2E 테스트
pnpm test:e2e

# 린팅 (코드 검사)
pnpm lint

# 타입 검사
pnpm typecheck
```

### 모바일 앱 명령어 (apps/mobile)

```bash
cd apps/mobile

# Expo 개발 서버 실행
node ../../node_modules/expo/bin/cli start

# 터널 모드로 실행 (외부 네트워크 접속)
node ../../node_modules/expo/bin/cli start --tunnel

# 캐시 클리어 후 실행
node ../../node_modules/expo/bin/cli start --clear

# Android 빌드
pnpm build:android

# iOS 빌드
pnpm build:ios

# 린팅
pnpm lint

# 타입 검사
pnpm typecheck
```

### 개발 워크플로우

1. **새 기능 개발**
   ```bash
   git checkout -b feature/new-feature
   pnpm dev
   ```

2. **코드 품질 확인**
   ```bash
   pnpm lint
   pnpm typecheck
   ```

3. **빌드 테스트**
   ```bash
   pnpm build
   ```

## 📦 빌드 및 배포

### 웹 앱 프로덕션 빌드

```bash
pnpm build:web
```

빌드 결과는 `apps/web/dist/` 디렉토리에 생성됩니다.

### 모바일 앱 빌드

```bash
cd apps/mobile

# EAS 빌드 (Expo Application Services)
pnpm build:android  # Android APK/AAB
pnpm build:ios      # iOS IPA
```

### 웹 앱 배포

#### Vercel 배포

```bash
npm install -g vercel
cd apps/web
vercel
```

#### Netlify 배포

```bash
npm install -g netlify-cli
cd apps/web
netlify deploy --prod
```

#### Render 배포

1. Render 대시보드에서 **New Static Site** 선택
2. GitHub 저장소 연결
3. 빌드 설정:
   - **Root Directory**: `apps/web`
   - **Build Command**: `pnpm build`
   - **Publish Directory**: `dist`
4. 환경 변수 추가:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_ENV=production`

## 📁 프로젝트 구조

```
budget-tracker/
├── apps/
│   ├── web/                      # React 웹 앱
│   │   ├── src/
│   │   │   ├── components/       # React 컴포넌트
│   │   │   │   ├── Auth/         # 인증 관련
│   │   │   │   ├── Dashboard/    # 대시보드
│   │   │   │   ├── Calendar/     # 캘린더 뷰
│   │   │   │   ├── Statistics/   # 통계 및 차트
│   │   │   │   ├── TransactionForm/
│   │   │   │   ├── TransactionList/
│   │   │   │   ├── RecurringExpenses/
│   │   │   │   ├── SavingsGoals/
│   │   │   │   ├── Legal/
│   │   │   │   └── ui/
│   │   │   ├── contexts/         # React Context
│   │   │   ├── hooks/            # Custom Hooks
│   │   │   ├── lib/              # 라이브러리 설정
│   │   │   ├── services/         # API 서비스
│   │   │   ├── types/            # TypeScript 타입
│   │   │   ├── utils/            # 유틸리티 함수
│   │   │   └── constants/        # 상수
│   │   ├── public/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tailwind.config.js
│   │
│   └── mobile/                   # React Native 모바일 앱
│       ├── app/                  # Expo Router (파일 기반 라우팅)
│       │   ├── _layout.tsx       # 루트 레이아웃
│       │   ├── index.tsx         # 홈 (인증 체크)
│       │   ├── login.tsx         # 로그인 화면
│       │   ├── (tabs)/           # 탭 네비게이션
│       │   │   ├── _layout.tsx
│       │   │   ├── summary.tsx
│       │   │   ├── calendar.tsx
│       │   │   ├── recurring.tsx
│       │   │   ├── savings.tsx
│       │   │   └── statistics.tsx
│       │   └── auth/
│       │       └── callback.tsx  # OAuth 콜백
│       ├── src/
│       │   ├── components/       # 모바일 전용 컴포넌트
│       │   ├── contexts/         # 모바일용 Context
│       │   └── lib/
│       │       └── supabase.ts   # AsyncStorage 사용
│       ├── global.css            # NativeWind 스타일
│       ├── app.json              # Expo 설정
│       ├── babel.config.js
│       ├── metro.config.js
│       ├── tailwind.config.js
│       └── package.json
│
├── packages/
│   └── shared/                   # 공유 코드 패키지
│       ├── src/
│       │   ├── types/            # 공유 TypeScript 타입
│       │   │   ├── database.ts   # Supabase DB 타입
│       │   │   ├── transaction.ts
│       │   │   ├── calendar.ts
│       │   │   ├── statistics.ts
│       │   │   ├── savingsGoal.ts
│       │   │   └── analytics.ts
│       │   └── utils/            # 공유 유틸리티 함수
│       │       ├── calculations.ts
│       │       ├── dateUtils.ts
│       │       ├── calendar.ts
│       │       └── statistics.ts
│       └── package.json
│
├── supabase/
│   └── migrations/               # 데이터베이스 마이그레이션
│
├── .env                          # 웹 환경 변수
├── .env.example                  # 환경 변수 템플릿
├── .npmrc                        # pnpm 설정 (hoisted mode)
├── package.json                  # 루트 패키지
├── pnpm-workspace.yaml           # pnpm 워크스페이스 설정
├── turbo.json                    # Turborepo 설정
└── README.md
```

## 🔧 주요 기능 상세 설명

### 고정지출 관리 시스템

고정지출은 매월 반복되는 지출을 자동으로 관리하는 기능입니다.

**주요 특징:**
- 매월 특정 날짜(1~31일)에 발생하는 지출 등록
- 생성일(`created_at`) 기준 적용: 고정지출 추가 이후부터만 통계에 반영
- 활성화/비활성화 토글로 일시 정지 가능
- 모든 통계 및 대시보드에 자동 반영

**적용 범위:**
- 요약 탭: 이번 달 수입/지출/잔액 계산
- 캘린더 탭: 해당 날짜에 "고정" 배지 및 금액 합산
- 통계 탭: 모든 기간 분석에 실제 발생 횟수만큼 포함

### 카테고리 예산 관리

카테고리별 월 예산을 설정하여 지출을 효율적으로 관리합니다.

**주요 특징:**
- 8개 카테고리별 독립적인 예산 설정
- 실시간 예산 사용률 표시 (퍼센트)
- 예산 초과 시 시각적 경고 (빨간색 표시)
- 통계 차트에 예산 라인 표시

### 통계 분석 시스템

다양한 기간과 방식으로 재무 데이터를 분석합니다.

**분석 모드:**
1. **월별**: 특정 년/월을 선택하여 해당 월만 분석
2. **1개월**: 최근 1개월 데이터
3. **3개월**: 최근 3개월 데이터
4. **6개월**: 최근 6개월 데이터
5. **1년**: 최근 1년 데이터
6. **전체**: 모든 데이터

**제공 통계:**
- 총 수입/지출/순액 및 일평균
- 카테고리별 지출 분포 (파이 차트)
- 예산 대비 사용률
- 최다 지출 카테고리 및 날짜

### 저축 목표 관리

재무 목표를 설정하고 진행 상황을 추적합니다.

**주요 특징:**
- 목표 금액 및 기한 설정
- 현재 저축 금액 입력 및 진행률 표시
- 카테고리별 분류 (여행, 비상금, 교육 등)
- 목표 달성 시 완료 처리
- 마감일 기준 정렬 및 관리

### 다크 모드

시스템 설정에 따라 자동으로 테마를 전환하거나 수동으로 설정할 수 있습니다.

- 다크/라이트/시스템 모드 지원
- localStorage에 선택 저장
- 모든 컴포넌트에서 일관된 색상 적용
- 부드러운 전환 애니메이션

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 🤝 기여

이슈 제보 및 Pull Request를 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.

---

**Made with ❤️ using React + React Native + Supabase**
