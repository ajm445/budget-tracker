# React Native Migration Guide

Budget Tracker 웹앱을 React Native 모바일 앱으로 전환하기 위한 가이드입니다.

## 변경사항 (2024-12)

- **시간대**: KST (한국 표준시)만 지원 (JST 제거)
- **인증**: Google OAuth + 이메일 계정만 지원 (LINE 인증 제거)

## 1. 개요

### 1.1 전환 목표
- 기존 웹앱을 유지하면서 React Native 모바일 앱 추가
- 비즈니스 로직 코드 공유 최대화 (60-70%)
- iOS/Android 앱 스토어 출시

### 1.2 핵심 결정사항

| 항목 | 선택 | 이유 |
|------|------|------|
| 패키지 매니저 | pnpm | 모노레포 최적화, 디스크 효율 |
| 빌드 도구 | Turborepo | 캐싱, 병렬 빌드 |
| 모바일 프레임워크 | Expo (Managed) | 빠른 개발, 쉬운 배포 |
| 스타일링 | NativeWind | Tailwind 호환 |
| 네비게이션 | Expo Router | 파일 기반, 직관적 |
| 차트 | Victory Native | 가장 안정적 |
| 저장소 | AsyncStorage | 표준 솔루션 |

### 1.3 백엔드/DB 변경

**변경 불필요!**

| 항목 | 상태 | 비고 |
|------|------|------|
| Supabase 백엔드 | 호환 | @supabase/supabase-js는 React Native 지원 |
| PostgreSQL DB | 변경 없음 | 스키마/RLS 정책 그대로 사용 |
| Realtime 구독 | 호환 | 모바일에서도 동일하게 작동 |
| Auth 시스템 | 설정 변경 | Deep linking으로 OAuth 리다이렉트 처리 |

---

## 2. 모노레포 구조

```
budget-tracker/
├── apps/
│   ├── web/                          # 기존 웹앱
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   └── components/           # 웹 전용 컴포넌트
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── mobile/                       # React Native 앱
│       ├── app/                      # Expo Router
│       │   ├── _layout.tsx
│       │   ├── index.tsx
│       │   ├── login.tsx
│       │   ├── (tabs)/
│       │   │   ├── _layout.tsx
│       │   │   ├── summary.tsx
│       │   │   ├── calendar.tsx
│       │   │   ├── recurring.tsx
│       │   │   ├── savings.tsx
│       │   │   └── statistics.tsx
│       │   └── (auth)/
│       │       └── callback.tsx
│       ├── src/
│       │   ├── components/
│       │   ├── contexts/
│       │   └── lib/
│       │       └── supabase.ts
│       ├── app.json
│       └── package.json
│
├── packages/
│   └── shared/                       # 공유 코드
│       ├── src/
│       │   ├── types/
│       │   ├── utils/
│       │   └── services/
│       └── package.json
│
├── docs/
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

---

## 3. 코드 공유 전략

### 3.1 100% 공유 가능 (packages/shared)

| 원본 경로 | 대상 경로 |
|----------|----------|
| `src/types/*.ts` | `packages/shared/src/types/` |
| `src/utils/calculations.ts` | `packages/shared/src/utils/` |
| `src/utils/dateUtils.ts` | `packages/shared/src/utils/` |
| `src/utils/calendar.ts` | `packages/shared/src/utils/` |
| `src/utils/statistics.ts` | `packages/shared/src/utils/` |
| `src/utils/searchUtils.ts` | `packages/shared/src/utils/` |

### 3.2 리팩토링 필요 (서비스)

서비스는 Supabase 클라이언트를 파라미터로 주입받도록 변경:

```typescript
// packages/shared/src/services/transactionService.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

export const createTransactionService = (supabase: SupabaseClient<Database>) => ({
  async fetchTransactions(userId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    return { data, error };
  },
  // ... 나머지 메서드
});
```

### 3.3 플랫폼별 분리 필요

| 파일 | 웹 | 모바일 |
|------|-----|--------|
| Storage | localStorage | AsyncStorage |
| Auth Redirect | window.location.origin | Linking.createURL() |
| Charts | recharts | Victory Native |
| Navigation | react-router-dom | Expo Router |

---

## 4. 플랫폼 추상화

### 4.1 Storage 추상화

```typescript
// packages/shared/src/storage/types.ts
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
```

**웹 구현:**
```typescript
// apps/web/src/storage/webStorage.ts
export const webStorage: StorageAdapter = {
  getItem: async (key) => localStorage.getItem(key),
  setItem: async (key, value) => localStorage.setItem(key, value),
  removeItem: async (key) => localStorage.removeItem(key),
};
```

**모바일 구현:**
```typescript
// apps/mobile/src/storage/mobileStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
export const mobileStorage: StorageAdapter = AsyncStorage;
```

### 4.2 Supabase 클라이언트 (모바일)

```typescript
// apps/mobile/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// 앱 상태에 따른 세션 갱신
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
```

### 4.3 OAuth Deep Linking

**app.json 설정:**
```json
{
  "expo": {
    "scheme": "budget-tracker",
    "ios": {
      "bundleIdentifier": "com.yourcompany.budgettracker"
    },
    "android": {
      "package": "com.yourcompany.budgettracker"
    }
  }
}
```

**AuthContext 구현:**
```typescript
import * as Linking from 'expo-linking';

const signInWithGoogle = async () => {
  const redirectTo = Linking.createURL('/auth/callback');
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });
  return { error };
};
```

---

## 5. 라이브러리 교체

| 웹 라이브러리 | React Native 대체 | 비고 |
|-------------|------------------|------|
| `react-router-dom` | `expo-router` | 파일 기반 라우팅 |
| `recharts` | `victory-native` | SVG 기반 차트 |
| `react-hot-toast` | `react-native-toast-message` | 토스트 알림 |
| `lucide-react` | `lucide-react-native` | 동일 API |

### 5.1 모바일 앱 의존성

```json
{
  "dependencies": {
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "expo-linking": "~7.0.0",
    "expo-secure-store": "~14.0.0",
    "react-native": "0.76.0",
    "react-native-safe-area-context": "4.14.0",
    "react-native-screens": "~4.4.0",
    "react-native-gesture-handler": "~2.20.0",
    "react-native-reanimated": "~3.16.0",
    "@supabase/supabase-js": "^2.75.1",
    "@react-native-async-storage/async-storage": "1.24.0",
    "nativewind": "^4.0.0",
    "victory-native": "^41.0.0",
    "react-native-svg": "15.8.0",
    "react-native-toast-message": "^2.2.0",
    "lucide-react-native": "^0.460.0"
  }
}
```

---

## 6. 구현 단계

### Phase 1: 모노레포 설정 (3-4일)

1. pnpm 워크스페이스 초기화
2. `packages/shared` 패키지 생성
3. 기존 웹앱을 `apps/web`으로 이동
4. TypeScript 경로 별칭 설정
5. Turborepo 빌드 파이프라인 구성

### Phase 2: 공유 코드 추출 (3-4일)

1. types/ 파일 이동
2. utils/ 파일 이동
3. services/ 리팩토링 (클라이언트 주입)
4. 웹앱에서 import 경로 수정

### Phase 3: Expo 초기화 (2-3일)

1. `npx create-expo-app apps/mobile`
2. NativeWind 설정
3. Expo Router 설정
4. 환경 변수 설정

### Phase 4: 플랫폼 추상화 (4-5일)

1. Storage 추상화 레이어
2. Supabase 클라이언트 (모바일)
3. AuthContext 마이그레이션
4. ThemeContext 마이그레이션

### Phase 5: 모바일 UI (10-14일)

1. 기본 UI 컴포넌트 (Button, Card 등)
2. Dashboard 화면
3. TransactionList (FlatList)
4. TransactionForm
5. Calendar 컴포넌트
6. Statistics 차트 (Victory)
7. Auth 화면

### Phase 6: 테스트/QA (5-7일)

1. 유닛 테스트
2. iOS/Android 실기기 테스트
3. 성능 최적화

### Phase 7: 앱 스토어 준비 (5-7일)

1. 앱 아이콘/스플래시
2. 스토어 메타데이터
3. EAS Build 설정
4. 앱 서명 및 제출

---

## 7. 예상 일정

| 단계 | 기간 | 누적 |
|------|------|------|
| Phase 1: 모노레포 설정 | 3-4일 | 1주 |
| Phase 2: 공유 코드 추출 | 3-4일 | 1-2주 |
| Phase 3: Expo 초기화 | 2-3일 | 2주 |
| Phase 4: 플랫폼 추상화 | 4-5일 | 2-3주 |
| Phase 5: 모바일 UI | 10-14일 | 3-5주 |
| Phase 6: 테스트/QA | 5-7일 | 5-6주 |
| Phase 7: 앱 스토어 | 5-7일 | 6-7주 |

**총 예상 기간: 6-8주**

---

## 8. 리스크 및 대응

| 리스크 | 영향 | 대응 방안 |
|--------|------|----------|
| NativeWind 호환성 | 중간 | 조기 테스트, CSS-in-JS 대안 |
| Victory 성능 | 중간 | FlatList 가상화, 데이터 제한 |
| Android OAuth | 높음 | 실기기 철저히 테스트 |
| Expo EAS 빌드 | 중간 | 주기적 빌드 테스트 |

---

## 9. 참고 자료

- [Expo Documentation](https://docs.expo.dev/)
- [NativeWind](https://www.nativewind.dev/)
- [Victory Native](https://formidable.com/open-source/victory/docs/native/)
- [Supabase React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
