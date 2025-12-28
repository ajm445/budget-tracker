/**
 * 공통 타입 정의 (플랫폼 독립적)
 */

export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}
