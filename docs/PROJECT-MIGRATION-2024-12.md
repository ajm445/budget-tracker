# 프로젝트 주제 변경 및 기능 축소 문서

**Project Migration: Japan Working Holiday Budget Tracker → General Budget Tracker**

## 1. 개요 (Overview)

**변경 일자**: 2024년 12월 24일

**변경 이유**:
- 일본 워킹홀리데이 특화 기능이 일반 사용자에게는 불필요
- 다중 화폐 지원으로 인한 복잡도 증가
- 환율 API 의존성 제거로 안정성 향상
- 단순하고 직관적인 사용자 경험 제공

**목적**: 일본 워킹홀리데이 전용 가계부에서 단순하고 범용적인 가계부 앱으로 전환

## 2. 변경 사항 요약 (Summary of Changes)

- ✅ 프로젝트 주제 변경: 일본 워킹홀리데이 → 일반 가계부
- ✅ 일본 워킹홀리데이 초기비용 계산기 제거
- ✅ 다중 화폐 지원 제거 (KRW만 사용)
- ✅ 환율 변환 기능 완전 제거
- ✅ 환율 API 의존성 제거 (axios 라이브러리 제거)
- ✅ 모드 전환 네비게이션 제거
- ✅ 앱 메타데이터 일반화 (HTML title, description, keywords)
- ✅ 번들 크기 최적화 (415KB → 400KB)

## 3. 제거된 기능 (Removed Features)

### 3.1. 초기비용 계산기 (Initial Cost Calculator)
- 일본 워킹홀리데이 초기비용 계산기 탭 전체
- 도쿄/오사카 지역별 비용 계산 기능
- 16개 일본 특화 카테고리 (항공권, 비자, 숙박, 교통비 등)
- 지역별 예상 비용 요약 기능

### 3.2. 다중 화폐 지원 (Multi-Currency Support)
- 화폐 선택 기능 (KRW/USD/JPY)
- 실시간 환율 API 연동 (ExchangeRate-API.com)
- 화폐 변환 기능
- 환율 정보 표시
- CurrencySelector 컴포넌트

### 3.3. 모드 전환 시스템 (Mode Switching)
- 가계부/초기비용 계산기 모드 전환 UI
- ModeNavigation 컴포넌트
- AppModeContext (모드 관리 컨텍스트)

## 4. 삭제된 파일 및 디렉토리 (Deleted Files)

### 4.1. 초기비용 계산기 관련

```
src/components/InitialCostCalculator/
├── InitialCostCalculator.tsx
├── CostCategoryCard.tsx
├── CostSummary.tsx
├── CountrySelector.tsx
├── JapanCostCategoryCard.tsx
├── JapanCostSummary.tsx
├── JapanRegionSelector.tsx
└── index.ts
```

```
src/data/
├── initialCostCategories.ts
└── japanCostCategories.ts
```

```
src/types/
├── initialCost.ts
└── japanCost.ts
```

### 4.2. 환율 관련

```
src/contexts/CurrencyContext.tsx
src/hooks/useCurrency.ts
src/hooks/useCurrencyConversion.ts
src/utils/currency.ts
src/utils/currency.test.ts
src/types/currency.ts
src/components/Dashboard/CurrencySelector.tsx
e2e/currency-conversion.spec.ts
```

### 4.3. 네비게이션

```
src/components/Navigation/
├── ModeNavigation.tsx
└── index.ts

src/contexts/AppModeContext.tsx
```

**총 삭제 파일 수**: 25개

## 5. 수정된 파일 (Modified Files)

### 5.1. 타입 정의 (Type Definitions)

#### src/types/transaction.ts
**변경 내용**: `currency`, `amountInKRW` 필드 제거

```typescript
// Before
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  currency: CurrencyCode;
  amountInKRW: number;
  createdAt?: string;
  updatedAt?: string;
}

// After
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;  // KRW만 사용
  category: string;
  description: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}
```

#### src/types/database.ts
**변경 내용**: 모든 테이블에서 currency 관련 필드 제거

```typescript
// transactions 테이블 - Before
Row: {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  currency: 'KRW' | 'USD' | 'JPY';
  amount_in_krw: number;
  created_at: string;
  updated_at: string;
}

// transactions 테이블 - After
Row: {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;  // KRW만 사용
  category: string;
  description: string;
  date: string;
  created_at: string;
  updated_at: string;
}
```

**동일한 패턴으로 변경된 테이블**:
- `recurring_expenses`: `currency`, `amount_in_krw` 제거
- `category_budgets`: `currency`, `budget_amount_in_krw` 제거
- `savings_goals`: `currency`, `target_amount_in_krw`, `current_amount_in_krw` 제거

#### src/types/savingsGoal.ts
**변경 내용**: currency 관련 필드 제거

```typescript
// Before
export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: CurrencyCode;
  targetAmountInKRW: number;
  currentAmountInKRW: number;
  deadline: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// After
export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}
```

#### src/types/index.ts
**변경 내용**: currency export 제거

```typescript
// Before
export type { Currency, CurrencyCode } from './currency';

// After
// 제거됨
```

### 5.2. 서비스 파일 (Service Files)

#### src/services/transactionService.ts
**변경 내용**: 환율 변환 로직 제거, 매핑 함수 단순화

```typescript
// Before
const mapSupabaseToLocal = (transaction: DBTransaction): LocalTransaction => {
  return {
    id: transaction.id,
    type: transaction.type,
    amount: transaction.amount,
    category: transaction.category,
    description: transaction.description,
    date: transaction.date,
    currency: transaction.currency as CurrencyCode,
    amountInKRW: transaction.amount_in_krw,
    createdAt: transaction.created_at,
    updatedAt: transaction.updated_at,
  };
};

const mapLocalToSupabase = (transaction: Omit<LocalTransaction, 'id' | 'createdAt' | 'updatedAt'>): DBTransactionInsert => {
  return {
    type: transaction.type,
    amount: transaction.amount,
    category: transaction.category,
    description: transaction.description,
    date: transaction.date,
    currency: transaction.currency,
    amount_in_krw: transaction.amountInKRW,
  };
};

// After
const mapSupabaseToLocal = (transaction: DBTransaction): LocalTransaction => {
  return {
    id: transaction.id,
    type: transaction.type,
    amount: transaction.amount,
    category: transaction.category,
    description: transaction.description,
    date: transaction.date,
    createdAt: transaction.created_at,
    updatedAt: transaction.updated_at,
  };
};

const mapLocalToSupabase = (transaction: Omit<LocalTransaction, 'id' | 'createdAt' | 'updatedAt'>): DBTransactionInsert => {
  return {
    type: transaction.type,
    amount: transaction.amount,
    category: transaction.category,
    description: transaction.description,
    date: transaction.date,
  };
};
```

#### src/services/recurringExpenseService.ts
**변경 내용**: `amount_in_krw` → `amount` 변경

```typescript
// Before
const mapSupabaseToLocal = (expense: DBRecurringExpense): LocalRecurringExpense => {
  return {
    id: expense.id,
    userId: expense.user_id,
    category: expense.category,
    amount: expense.amount_in_krw,
    // ...
  };
};

// After
const mapSupabaseToLocal = (expense: DBRecurringExpense): LocalRecurringExpense => {
  return {
    id: expense.id,
    userId: expense.user_id,
    category: expense.category,
    amount: expense.amount,
    // ...
  };
};
```

#### src/services/savingsGoalService.ts
**변경 내용**: currency 필드 제거

```typescript
// Before
const mapSupabaseToLocal = (goal: DBSavingsGoal): LocalSavingsGoal => {
  return {
    id: goal.id,
    userId: goal.user_id,
    name: goal.name,
    targetAmount: goal.target_amount,
    currentAmount: goal.current_amount,
    currency: goal.currency as CurrencyCode,
    targetAmountInKRW: goal.target_amount_in_krw,
    currentAmountInKRW: goal.current_amount_in_krw,
    // ...
  };
};

// After
const mapSupabaseToLocal = (goal: DBSavingsGoal): LocalSavingsGoal => {
  return {
    id: goal.id,
    userId: goal.user_id,
    name: goal.name,
    targetAmount: goal.target_amount,
    currentAmount: goal.current_amount,
    // ...
  };
};
```

#### src/services/categoryBudgetService.ts
**변경 내용**: `budget_amount_in_krw` → `budget_amount` 변경

```typescript
// Before
budgetAmount: budget.budget_amount_in_krw,

// After
budgetAmount: budget.budget_amount,
```

### 5.3. 유틸리티 (Utilities)

#### src/utils/calculations.ts
**변경 내용**: `amountInKRW` → `amount` 변경

```typescript
// Before
export const calculateTotalIncome = (transactions: Transaction[]): number => {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amountInKRW, 0);
};

export const calculateTotalExpense = (transactions: Transaction[]): number => {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amountInKRW, 0);
};

// After
export const calculateTotalIncome = (transactions: Transaction[]): number => {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
};

export const calculateTotalExpense = (transactions: Transaction[]): number => {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
};
```

#### src/utils/calendar.ts
**변경 내용**: `amount_in_krw` → `amount` 변경

```typescript
// Before
total: dayTransactions.reduce((sum, t) => sum + t.amount_in_krw, 0),

// After
total: dayTransactions.reduce((sum, t) => sum + t.amount, 0),
```

#### src/utils/searchUtils.ts
**변경 내용**: `amountInKRW` → `amount` 변경

```typescript
// Before
const normalizedAmount = transaction.amountInKRW.toString();

// After
const normalizedAmount = transaction.amount.toString();
```

#### src/utils/statistics.ts
**변경 내용**: 환율 변환 로직 제거

```typescript
// Before
const categoryExpenses = expenses.reduce<Record<string, number>>((acc, t) => {
  acc[t.category] = (acc[t.category] || 0) + t.amountInKRW;
  return acc;
}, {});

// After
const categoryExpenses = expenses.reduce<Record<string, number>>((acc, t) => {
  acc[t.category] = (acc[t.category] || 0) + t.amount;
  return acc;
}, {});
```

### 5.4. React 컴포넌트 (React Components)

#### src/App.tsx
**변경 내용**: CurrencyProvider 제거

```typescript
// Before
import { CurrencyProvider } from './contexts/CurrencyContext';

function App() {
  return (
    <CurrencyProvider>
      <MainApp />
    </CurrencyProvider>
  );
}

// After
function App() {
  return <MainApp />;
}
```

#### src/MainApp.tsx
**변경 내용**: 모드 전환 로직 제거, 헤더 단순화, 환율 관련 코드 제거

```typescript
// Before
import { ModeNavigation } from './components/Navigation/ModeNavigation';
import { InitialCostCalculator } from './components/InitialCostCalculator';
import { useAppMode } from './contexts/AppModeContext';

const addTransaction = async (
  data: TransactionFormData & { amountInKRW: number }
): Promise<void> => {
  const newTransaction = {
    ...data,
    currency: data.currency,
    amountInKRW: data.amountInKRW,
  };
  // ...
};

// After
const addTransaction = async (
  data: TransactionFormData
): Promise<void> => {
  const newTransaction = {
    type: data.type,
    amount: parseFloat(data.amount),
    category: data.category,
    description: data.description,
    date: formatInputDateToKorean(data.date),
  };
  // ...
};
```

#### src/components/TransactionForm/
**변경 내용**: 화폐 선택 UI 제거

- TransactionForm.tsx: currency dropdown 제거
- TransactionFormModal.tsx: currency 파라미터 제거
- 모든 금액은 KRW로 처리

#### src/components/Dashboard/
**변경 내용**: CurrencySelector 컴포넌트 제거

- Dashboard.tsx: CurrencySelector import 및 사용 제거
- 금액 표시 단순화 (₩ 기호만 사용)

#### src/components/RecurringExpenses/
**변경 내용**: 환율 관련 코드 제거

- CategoryBudgetManager.tsx: `convertCurrency`, `convertFromKRW` 함수 제거
- RecurringExpenseForm.tsx: currency 필드 제거
- 모든 금액 계산 단순화

#### src/components/SavingsGoals/
**변경 내용**: currency 필드 제거

- SavingsGoalCard.tsx: currency 표시 제거
- SavingsGoalForm.tsx: currency 선택 UI 제거
- 진척도 계산 단순화

#### src/components/Statistics/
**변경 내용**: 환율 표시 제거

- Statistics.tsx: 환율 정보 제거
- 모든 차트 데이터는 KRW 기준

#### src/components/Calendar/
**변경 내용**: 환율 변환 로직 제거

- Calendar.tsx: 일일 합계 계산 단순화
- CalendarDay.tsx: 금액 표시 단순화

### 5.5. 설정 파일 (Configuration Files)

#### vite.config.ts
**변경 내용**: axios를 utils-vendor에서 제거

```typescript
// Before
manualChunks: {
  'react-vendor': ['react', 'react-dom', 'react-router-dom'],
  'ui-vendor': ['react-hot-toast', 'clsx'],
  'chart-vendor': ['recharts'],
  'supabase-vendor': ['@supabase/supabase-js'],
  'utils-vendor': ['axios'],
}

// After
manualChunks: {
  'react-vendor': ['react', 'react-dom', 'react-router-dom'],
  'ui-vendor': ['react-hot-toast', 'clsx'],
  'chart-vendor': ['recharts'],
  'supabase-vendor': ['@supabase/supabase-js'],
}
```

#### package.json
**변경 내용**: axios 의존성 제거

```bash
npm uninstall axios
```

axios는 환율 API 호출에만 사용되었으며, 더 이상 필요하지 않음.

#### index.html
**변경 내용**: 메타데이터 일반화

```html
<!-- Before -->
<title>일본 워킹홀리데이 가계부 | Japan Working Holiday Budget Tracker</title>
<meta name="description" content="일본 워킹홀리데이를 준비하는 분들을 위한 전용 가계부 앱입니다. 초기 비용 계산부터 일상적인 수입/지출 관리까지 모든 것을 한 곳에서 관리하세요." />
<meta name="keywords" content="일본 워킹홀리데이, 가계부, 초기비용 계산기, Japan Working Holiday, Budget Tracker, 여행 경비, 환율 계산" />

<!-- After -->
<title>가계부 | Personal Budget Tracker</title>
<meta name="description" content="수입과 지출을 효율적으로 관리하는 스마트 가계부 앱입니다. 예산 관리, 반복 지출 추적, 저축 목표 설정 등 다양한 기능을 제공합니다." />
<meta name="keywords" content="가계부, Budget Tracker, 예산 관리, 지출 관리, 수입 관리, 저축 목표, 재무 관리" />
```

### 5.6. 훅 (Hooks)

#### src/hooks/useAnalyticsEvent.ts
**변경 내용**: currency 파라미터 제거

```typescript
// Before
const trackAddTransaction = useCallback(
  (type: TransactionType, currency: CurrencyCode, amount: number) => {
    trackEvent({
      category: 'Transaction',
      action: 'add_transaction',
      label: `${type}_${currency}`,
      value: amount,
      transaction_type: type,
      currency,
    });
  },
  [trackEvent]
);

// After
const trackAddTransaction = useCallback(
  (type: TransactionType, amount: number) => {
    trackEvent({
      category: 'Transaction',
      action: 'add_transaction',
      label: type,
      value: amount,
      transaction_type: type,
    });
  },
  [trackEvent]
);
```

## 6. 데이터베이스 스키마 변경 (Database Schema Changes)

### 변경 개요

모든 테이블에서 다중 화폐 지원을 제거하고 KRW 단일 화폐만 사용하도록 변경했습니다.

### transactions 테이블

```sql
-- Before
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC(15, 2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('KRW', 'USD', 'JPY')),
  amount_in_krw NUMERIC(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- After
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC(15, 2) NOT NULL,  -- KRW만 사용
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### recurring_expenses 테이블

```sql
-- Before
CREATE TABLE recurring_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('KRW', 'USD', 'JPY')),
  amount_in_krw NUMERIC(15, 2) NOT NULL,
  frequency TEXT NOT NULL,
  -- ...
);

-- After
CREATE TABLE recurring_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,  -- KRW만 사용
  frequency TEXT NOT NULL,
  -- ...
);
```

### category_budgets 테이블

```sql
-- Before
CREATE TABLE category_budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  budget_amount NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('KRW', 'USD', 'JPY')),
  budget_amount_in_krw NUMERIC(15, 2) NOT NULL,
  -- ...
);

-- After
CREATE TABLE category_budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  budget_amount NUMERIC(15, 2) NOT NULL,  -- KRW만 사용
  -- ...
);
```

### savings_goals 테이블

```sql
-- Before
CREATE TABLE savings_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount NUMERIC(15, 2) NOT NULL,
  current_amount NUMERIC(15, 2) DEFAULT 0,
  currency TEXT NOT NULL CHECK (currency IN ('KRW', 'USD', 'JPY')),
  target_amount_in_krw NUMERIC(15, 2) NOT NULL,
  current_amount_in_krw NUMERIC(15, 2) DEFAULT 0,
  -- ...
);

-- After
CREATE TABLE savings_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount NUMERIC(15, 2) NOT NULL,  -- KRW만 사용
  current_amount NUMERIC(15, 2) DEFAULT 0,
  -- ...
);
```

## 7. Supabase 마이그레이션 SQL

### 마이그레이션 스크립트

프로덕션 환경에 배포하기 전에 다음 SQL 스크립트를 Supabase SQL 에디터에서 실행해야 합니다.

```sql
-- ==========================================
-- 가계부 프로젝트 마이그레이션 스크립트
-- 목적: 다중 화폐 지원 제거 (KRW만 사용)
-- 실행 전 필수: 데이터베이스 백업
-- ==========================================

-- Step 1: 기존 데이터 변환 (amount_in_krw 값을 amount로 복사)
UPDATE transactions
SET amount = amount_in_krw
WHERE amount_in_krw IS NOT NULL;

UPDATE recurring_expenses
SET amount = amount_in_krw
WHERE amount_in_krw IS NOT NULL;

UPDATE category_budgets
SET budget_amount = budget_amount_in_krw
WHERE budget_amount_in_krw IS NOT NULL;

UPDATE savings_goals
SET target_amount = target_amount_in_krw,
    current_amount = current_amount_in_krw
WHERE target_amount_in_krw IS NOT NULL;

-- Step 2: 컬럼 삭제
ALTER TABLE transactions
DROP COLUMN IF EXISTS currency,
DROP COLUMN IF EXISTS amount_in_krw;

ALTER TABLE recurring_expenses
DROP COLUMN IF EXISTS currency,
DROP COLUMN IF EXISTS amount_in_krw;

ALTER TABLE category_budgets
DROP COLUMN IF EXISTS currency,
DROP COLUMN IF EXISTS budget_amount_in_krw;

ALTER TABLE savings_goals
DROP COLUMN IF EXISTS currency,
DROP COLUMN IF EXISTS target_amount_in_krw,
DROP COLUMN IF EXISTS current_amount_in_krw;

-- Step 3: 검증 쿼리 (마이그레이션 후 실행하여 확인)
-- transactions 테이블 확인
SELECT COUNT(*) as total_transactions FROM transactions;
SELECT SUM(amount) as total_amount FROM transactions;

-- recurring_expenses 테이블 확인
SELECT COUNT(*) as total_recurring FROM recurring_expenses;

-- category_budgets 테이블 확인
SELECT COUNT(*) as total_budgets FROM category_budgets;

-- savings_goals 테이블 확인
SELECT COUNT(*) as total_goals FROM savings_goals;
```

### ⚠️ 주의사항

1. **백업 필수**: 프로덕션 환경에서 실행하기 전에 반드시 데이터베이스 전체 백업
2. **테스트 환경 먼저**: 개발/스테이징 환경에서 먼저 테스트 후 프로덕션 적용
3. **데이터 검증**: Step 3의 검증 쿼리로 마이그레이션 성공 여부 확인
4. **RLS 정책**: Row Level Security 정책은 영향받지 않음 (user_id 기반이므로)
5. **다운타임**: 마이그레이션 중 짧은 다운타임 발생 가능

### 롤백 계획

마이그레이션 실패 시 롤백을 위해 백업에서 복원:

```sql
-- 백업에서 복원 (Supabase Dashboard → Database → Backups 사용)
-- 또는 pg_dump로 생성한 백업 파일 사용
```

## 8. 코드 변경 패턴 (Code Change Patterns)

### 8.1. Transaction 타입 사용 변경

```typescript
// Before - 여러 필드 사용
const totalIncome = transactions
  .filter(t => t.type === 'income')
  .reduce((sum, t) => sum + t.amountInKRW, 0);

const transaction = {
  amount: 50000,
  currency: 'JPY',
  amountInKRW: 500000,
};

// After - 단순화
const totalIncome = transactions
  .filter(t => t.type === 'income')
  .reduce((sum, t) => sum + t.amount, 0);

const transaction = {
  amount: 500000,  // KRW만 사용
};
```

### 8.2. 금액 표시 변경

```typescript
// Before - 화폐 선택에 따라 다른 표시
import { formatCurrency } from '../utils/currency';
<span>{formatCurrency(transaction.amountInKRW, currentCurrency)}</span>

// After - 항상 KRW 표시
<span>₩{transaction.amount.toLocaleString()}</span>
```

### 8.3. 서비스 함수 변경

```typescript
// Before - 환율 변환 포함
const addTransaction = async (data: TransactionFormData) => {
  const transaction = {
    ...data,
    currency: data.currency,
    amount_in_krw: convertToKRW(data.amount, data.currency)
  };
  return await supabase.from('transactions').insert(transaction);
};

// After - 단순한 저장
const addTransaction = async (data: TransactionFormData) => {
  const transaction = {
    type: data.type,
    amount: parseFloat(data.amount),
    category: data.category,
    description: data.description,
    date: data.date,
  };
  return await supabase.from('transactions').insert(transaction);
};
```

### 8.4. 컴포넌트 Props 변경

```typescript
// Before - currency prop 포함
interface TransactionFormProps {
  onSubmit: (data: TransactionFormData & {
    currency: CurrencyCode;
    amountInKRW: number;
  }) => void;
}

// After - currency 제거
interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => void;
}
```

### 8.5. 통계 계산 변경

```typescript
// Before - 카테고리별 지출 (환율 변환)
const categoryExpenses = expenses.reduce((acc, t) => {
  const amountInKRW = convertToKRW(t.amount, t.currency);
  acc[t.category] = (acc[t.category] || 0) + amountInKRW;
  return acc;
}, {});

// After - 카테고리별 지출 (단순 합계)
const categoryExpenses = expenses.reduce((acc, t) => {
  acc[t.category] = (acc[t.category] || 0) + t.amount;
  return acc;
}, {});
```

## 9. 영향 받는 사용자 데이터 (User Data Impact)

### 기존 사용자 데이터 처리

#### 1. USD/JPY로 저장된 거래
- Supabase에서 `amount_in_krw` 값을 `amount` 컬럼으로 복사
- `currency` 컬럼 삭제 전에 데이터 변환 필요
- 환율 변환된 KRW 값이 이미 `amount_in_krw`에 저장되어 있으므로 데이터 손실 없음

#### 2. LocalStorage 데이터
- 비로그인 모드 사용자의 임시 데이터는 새로고침 시 초기화
- 마이그레이션 불필요
- 사용자가 로그인하여 데이터를 Supabase에 저장하면 새 스키마 적용

#### 3. 데이터 마이그레이션 순서
1. **백업**: 모든 테이블 백업
2. **검증**: 모든 레코드에 `amount_in_krw` 값이 있는지 확인
3. **변환**: `amount_in_krw` → `amount` 복사
4. **확인**: 변환된 데이터 검증
5. **삭제**: currency 관련 컬럼 삭제

### 예상 데이터 손실 위험

- **위험도**: 낮음
- **이유**: 모든 거래에 `amount_in_krw` 필드가 있으므로 원본 화폐에 관계없이 KRW 값 보존
- **예외 처리**: `amount_in_krw`가 NULL인 경우 → 마이그레이션 전에 수동으로 처리 필요

## 10. 빌드 및 테스트 결과 (Build & Test Results)

### 변경 전

```
Build Result:
- Bundle Size: ~415KB
- Gzip Size: ~109KB
- Dependencies: 48개 (axios 포함)
- Manual Chunks: 5개 (utils-vendor 포함)
- TypeScript Errors: 0
```

### 변경 후

```
Build Result:
- Bundle Size: 400.68KB ✅ (-14.32KB, -3.4%)
- Gzip Size: 104.72KB ✅ (-4.28KB, -3.9%)
- Dependencies: 47개 (axios 제거)
- Manual Chunks: 4개 (utils-vendor 제거)
- TypeScript Errors: 0 ✅
- Production Build: Success ✅
```

### 성능 개선

- **번들 크기 감소**: 415KB → 400KB (약 15KB 감소)
- **Gzip 크기 감소**: 109KB → 105KB (약 4KB 감소)
- **의존성 감소**: axios 제거로 1개 의존성 감소
- **빌드 경고**: utils-vendor 빈 청크 경고 해결
- **복잡도 감소**: 환율 관련 로직 제거로 코드 복잡도 감소

### TypeScript 컴파일 결과

```bash
$ tsc --noEmit

# Before migration
Found 120+ errors

# After all fixes
No errors found ✅
```

### 테스트 파일 영향

- **삭제된 테스트**: `src/utils/currency.test.ts`, `e2e/currency-conversion.spec.ts`
- **수정 필요 테스트**: 없음 (기존 테스트들은 모두 통과)
- **새 테스트 필요**: 없음 (기능 제거이므로)

## 11. 향후 계획 (Future Plans)

### 단기 계획 (1-2주)

1. **Supabase 데이터베이스 스키마 실제 변경**
   - 마이그레이션 SQL 스크립트 실행
   - 데이터 검증 및 확인

2. **기존 사용자 데이터 마이그레이션**
   - 프로덕션 데이터 백업
   - 마이그레이션 실행
   - 데이터 무결성 검증

3. **프로덕션 배포**
   - 스테이징 환경에서 최종 테스트
   - 프로덕션 배포
   - 모니터링

### 중장기 계획 (1-3개월)

1. **사용자 피드백 수집**
   - 단순화된 UI에 대한 사용자 반응 확인
   - 추가 기능 요청 수집

2. **예산 관리 고도화**
   - 카테고리별 예산 알림 개선
   - 예산 초과 경고 기능 강화
   - 월별 예산 vs 실제 지출 비교 리포트

3. **통계 분석 기능 확장**
   - 소비 패턴 분석
   - 지출 트렌드 예측
   - 절약 추천 기능

4. **UI/UX 개선**
   - 모바일 최적화
   - 다크 모드 개선
   - 접근성 향상

### 장기 계획 (3개월 이상)

1. **다중 화폐 재검토**
   - 사용자 요청이 많을 경우 선택적 플러그인 형태로 재구현
   - 환율 API는 사용자가 직접 선택 가능하도록 (더 안정적인 API)
   - 기본은 KRW 유지, 필요시에만 활성화

2. **공유 기능**
   - 가계부 공유 (가족, 룸메이트)
   - 권한 관리
   - 실시간 동기화

3. **데이터 분석 및 인사이트**
   - AI 기반 소비 패턴 분석
   - 맞춤형 절약 팁 제공
   - 재무 건강 점수

4. **플랫폼 확장**
   - 모바일 앱 개발 (React Native)
   - 브라우저 확장 프로그램
   - API 제공

## 12. 참고 자료 (References)

### 관련 문서

- **프로젝트 문서**: `docs/CLAUDE.md` - 프로젝트 전체 문서
- **기능 추천**: `docs/feature-recommendations.md` - 향후 기능 추천 목록
- **Supabase 설정**: `docs/supabase-setup.md` - Supabase 설정 가이드

### Git 커밋 히스토리

주요 변경사항이 포함된 커밋들:
- 초기비용 계산기 제거
- 환율 관련 코드 제거
- 타입 정의 업데이트
- 서비스 파일 업데이트
- 컴포넌트 업데이트
- 빌드 설정 최적화

### 외부 리소스

- **React 19 문서**: https://react.dev/
- **TypeScript 5.8 문서**: https://www.typescriptlang.org/
- **Supabase 문서**: https://supabase.com/docs
- **Vite 문서**: https://vitejs.dev/

### 기술 스택 버전

```json
{
  "react": "^19.1.1",
  "typescript": "~5.8.3",
  "vite": "^7.1.7",
  "@supabase/supabase-js": "^2.50.1",
  "tailwindcss": "^3.3.0"
}
```

## 마무리

이 마이그레이션은 프로젝트를 단순화하고 일반 사용자에게 더 접근하기 쉽게 만들기 위한 중요한 단계입니다. 일본 워킹홀리데이 특화 기능을 제거하고 다중 화폐 지원을 없애면서 다음과 같은 이점을 얻었습니다:

✅ **단순성**: 복잡한 환율 계산 로직 제거로 코드 복잡도 감소
✅ **안정성**: 외부 환율 API 의존성 제거로 안정성 향상
✅ **성능**: 번들 크기 감소로 로딩 속도 개선
✅ **유지보수성**: 적은 코드와 의존성으로 유지보수 용이
✅ **범용성**: 모든 사용자가 쉽게 사용할 수 있는 일반 가계부 앱

향후 사용자 피드백을 반영하여 필요한 기능을 추가하고, 더 나은 사용자 경험을 제공하는 가계부 앱으로 발전시켜 나갈 계획입니다.

---

**문서 작성일**: 2024년 12월 24일
**문서 버전**: 1.0
**작성자**: Development Team
