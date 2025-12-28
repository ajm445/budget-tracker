import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import Toast from 'react-native-toast-message';
import { supabase } from '../src/lib/supabase';

export default function LoginScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  const handleEmailLogin = async () => {
    setLoading('email');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Toast.show({
        type: 'error',
        text1: '로그인 실패',
        text2: '이메일과 비밀번호를 확인해주세요.',
      });
    } else {
      router.replace('/(tabs)/summary');
    }
    setLoading(null);
  };

  const handleEmailSignup = async () => {
    setLoading('email');

    if (!username.trim()) {
      Toast.show({
        type: 'error',
        text1: '아이디 필요',
        text2: '아이디를 입력해주세요.',
      });
      setLoading(null);
      return;
    }

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    if (error) {
      Toast.show({
        type: 'error',
        text1: '회원가입 실패',
        text2: '다시 시도해주세요.',
      });
    } else if (data.user) {
      // Update username in profiles
      await supabase
        .from('profiles')
        .update({ username })
        .eq('id', data.user.id);

      Toast.show({
        type: 'success',
        text1: '회원가입 완료',
        text2: '로그인해주세요.',
      });
      setMode('signin');
    }
    setLoading(null);
  };

  const handleGoogleLogin = async () => {
    setLoading('google');
    const redirectUrl = Linking.createURL('/auth/callback');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Google 로그인 실패',
        text2: '다시 시도해주세요.',
      });
    }
    setLoading(null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6 py-8">
          {/* 로고 */}
          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-indigo-600 rounded-2xl items-center justify-center mb-4">
              <Text className="text-3xl">✈️</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              일본 워킹홀리데이 가계부
            </Text>
            <Text className="text-gray-600 dark:text-gray-300">
              소셜 계정으로 간편하게 시작하세요
            </Text>
          </View>

          {/* 탭 전환 */}
          <View className="flex-row gap-2 mb-6">
            <TouchableOpacity
              onPress={() => setMode('signin')}
              className={`flex-1 py-2 rounded-lg ${
                mode === 'signin'
                  ? 'bg-indigo-600'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  mode === 'signin'
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                로그인
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMode('signup')}
              className={`flex-1 py-2 rounded-lg ${
                mode === 'signup'
                  ? 'bg-indigo-600'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  mode === 'signup'
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                회원가입
              </Text>
            </TouchableOpacity>
          </View>

          {/* 폼 */}
          <View className="space-y-4 mb-6">
            {mode === 'signup' && (
              <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  아이디
                </Text>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="사용할 아이디를 입력하세요"
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  autoCapitalize="none"
                />
              </View>
            )}

            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                이메일
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="example@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                비밀번호
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </View>

            <TouchableOpacity
              onPress={mode === 'signin' ? handleEmailLogin : handleEmailSignup}
              disabled={loading === 'email'}
              className="bg-indigo-600 py-3 rounded-lg"
            >
              {loading === 'email' ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-medium">
                  {mode === 'signin' ? '로그인' : '회원가입'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* 구분선 */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
            <Text className="px-4 text-gray-500 dark:text-gray-400">또는</Text>
            <View className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
          </View>

          {/* Google 로그인 */}
          <TouchableOpacity
            onPress={handleGoogleLogin}
            disabled={loading !== null}
            className="flex-row items-center justify-center gap-3 px-6 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg"
          >
            {loading === 'google' ? (
              <ActivityIndicator color="#4B5563" />
            ) : (
              <Text className="text-gray-700 dark:text-gray-200 font-medium">
                Google로 계속하기
              </Text>
            )}
          </TouchableOpacity>

          {/* 약관 */}
          <Text className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400">
            로그인하면 서비스 약관과 개인정보 처리방침에 동의하는 것으로
            간주됩니다.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
