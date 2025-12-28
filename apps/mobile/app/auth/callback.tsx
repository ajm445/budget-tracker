import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../src/lib/supabase';

export default function AuthCallbackScreen() {
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      // URL에서 토큰 추출하여 세션 설정
      const accessToken = params.access_token as string;
      const refreshToken = params.refresh_token as string;

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error('Auth callback error:', error);
          router.replace('/login');
        } else {
          router.replace('/(tabs)/summary');
        }
      } else {
        // 토큰이 없으면 로그인 페이지로
        router.replace('/login');
      }
    };

    void handleCallback();
  }, [params]);

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
      <ActivityIndicator size="large" color="#4F46E5" />
      <Text className="mt-4 text-gray-600 dark:text-gray-400">
        로그인 처리 중...
      </Text>
    </View>
  );
}
