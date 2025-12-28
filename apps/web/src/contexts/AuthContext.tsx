import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database';
import { clearAllCategoryBudgetsFromLocal } from '../utils/localStorageBudget';

interface AuthContextType {
  // 인증 상태
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;

  // 인증 메서드
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUpWithEmail: (email: string, password: string, username: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;

  // 프로필 메서드
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;

  // 계정 관리 메서드
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchingProfileRef = useRef<string | null>(null);
  const lastFetchedUserIdRef = useRef<string | null>(null);
  const isInitializing = useRef<boolean>(true);

  // 프로필 데이터 가져오기 (중복 호출 방지)
  const fetchProfile = async (userId: string, force: boolean = false): Promise<void> => {
    // 같은 사용자의 프로필을 이미 가져왔으면 무시 (force가 아닐 경우)
    if (!force && lastFetchedUserIdRef.current === userId) {
      console.log('✅ Profile already fetched for user:', userId);
      return;
    }

    // 같은 userId로 이미 가져오는 중이면 무시
    if (fetchingProfileRef.current === userId) {
      console.log('⏳ Profile fetch already in progress for user:', userId);
      return;
    }

    fetchingProfileRef.current = userId;

    try {
      console.log('🔍 Fetching profile for user:', userId);
      const startTime = Date.now();

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const elapsed = Date.now() - startTime;
      console.log(`⏱️ Profile fetch took ${elapsed}ms`);

      if (error) {
        console.error('❌ Profile fetch error:', error);
        // 에러가 있어도 계속 진행 (프로필 없이도 앱 사용 가능하도록)
        setProfile(null);
        lastFetchedUserIdRef.current = userId; // 반복 시도 방지
      } else if (data) {
        console.log('✅ Profile fetched successfully');
        setProfile(data);
        lastFetchedUserIdRef.current = userId;
      } else {
        console.warn('⚠️ No profile data returned');
        setProfile(null);
        lastFetchedUserIdRef.current = userId;
      }
    } catch (error) {
      console.error('💥 Unexpected error fetching profile:', error);
      setProfile(null);
      lastFetchedUserIdRef.current = userId; // 반복 시도 방지
    } finally {
      console.log('🔓 Profile fetch completed, releasing lock');
      fetchingProfileRef.current = null;
    }
  };

  // 초기 세션 확인
  useEffect(() => {
    let isMounted = true;

    // 현재 세션 가져오기
    const initializeAuth = async (): Promise<void> => {
      try {
        console.log('🚀 Initializing auth...');
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (!isMounted) return;

        console.log('📦 Session loaded:', currentSession?.user?.email || 'No session');
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          console.log('👤 User found, fetching profile...');
          await fetchProfile(currentSession.user.id);
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
      } finally {
        if (isMounted) {
          console.log('✅ Auth initialization complete');
          isInitializing.current = false;
          setLoading(false);
        }
      }
    };

    void initializeAuth();

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        if (!isMounted) return;

        console.log('📢 Auth state changed:', _event, currentSession?.user?.email, 'isInitializing:', isInitializing.current);

        // 초기화 중에는 모든 이벤트 무시 (initializeAuth에서 처리함)
        if (isInitializing.current) {
          console.log('⏭️ Ignoring event during initialization:', _event);
          return;
        }

        // INITIAL_SESSION 이벤트는 무시 (initializeAuth에서 이미 처리함)
        if (_event === 'INITIAL_SESSION') {
          console.log('⏭️ Ignoring INITIAL_SESSION (already handled in init)');
          return;
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // SIGNED_IN 이벤트일 때만 프로필 가져오기
          if (_event === 'SIGNED_IN') {
            console.log('🔑 User signed in, fetching profile');
            await fetchProfile(currentSession.user.id);
          }
        } else {
          setProfile(null);
          lastFetchedUserIdRef.current = null;
        }

        setLoading(false);
      }
    );

    // 클린업
    return (): void => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 이메일/비밀번호 로그인
  const signInWithEmail = async (
    email: string,
    password: string
  ): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  // 이메일/비밀번호 회원가입
  const signUpWithEmail = async (
    email: string,
    password: string,
    username: string
  ): Promise<{ error: AuthError | null }> => {
    // 1. 사용자 생성
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username, // 메타데이터에 username 저장
        },
      },
    });

    if (error) return { error };

    // 2. username을 profiles 테이블에 업데이트
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        // @ts-expect-error - Supabase type inference issue, will be fixed with CLI generated types
        .update({ username })
        .eq('id', data.user.id);

      if (profileError) {
        console.error('Failed to update username:', profileError);
      }
    }

    return { error: null };
  };

  // Google 로그인
  const signInWithGoogle = async (): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    return { error };
  };

  // 로그아웃
  const signOut = async (): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      setProfile(null);

      // 로그아웃 시 임시 데이터 localStorage에서 제거
      console.log('🧹 Clearing temporary data from localStorage');
      localStorage.removeItem('temp_recurring_expenses');
      clearAllCategoryBudgetsFromLocal();
    }
    return { error };
  };

  // 프로필 업데이트
  const updateProfile = async (
    updates: Partial<Profile>
  ): Promise<{ error: Error | null }> => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        // @ts-expect-error - Supabase type inference issue, will be fixed with CLI generated types
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // 로컬 상태 업데이트 (강제 새로고침)
      await fetchProfile(user.id, true);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // 프로필 새로고침
  const refreshProfile = async (): Promise<void> => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  // 비밀번호 변경
  const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    // 현재 비밀번호로 재인증
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email || '',
      password: currentPassword,
    });

    if (signInError) {
      throw new Error('현재 비밀번호가 올바르지 않습니다.');
    }

    // 비밀번호 업데이트
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      throw new Error('비밀번호 변경에 실패했습니다.');
    }
  };

  // 계정 삭제
  const deleteAccount = async (): Promise<void> => {
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      // 1. 사용자의 모든 거래 내역 삭제
      const { error: transactionsError } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id);

      if (transactionsError) {
        console.error('Failed to delete transactions:', transactionsError);
        throw new Error('거래 내역 삭제에 실패했습니다.');
      }

      // 2. 프로필 비활성화 (실제 삭제 대신 is_active를 false로 설정)
      const { error: profileError } = await supabase
        .from('profiles')
        // @ts-expect-error - Supabase type inference issue, will be fixed with CLI generated types
        .update({ is_active: false })
        .eq('id', user.id);

      if (profileError) {
        console.error('Failed to deactivate profile:', profileError);
        throw new Error('프로필 비활성화에 실패했습니다.');
      }

      // 3. Supabase Auth에서 사용자 삭제
      // 참고: Supabase의 auth.admin.deleteUser()는 서버 측에서만 가능
      // 클라이언트에서는 계정 비활성화 후 로그아웃 처리
      await signOut();
    } catch (error) {
      console.error('Failed to delete account:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    updateProfile,
    refreshProfile,
    updatePassword,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
