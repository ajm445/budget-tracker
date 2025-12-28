import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SavingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['bottom']}>
      <View className="flex-1 items-center justify-center px-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          저축 목표
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-center">
          저축 목표를 설정하고 진행률을 확인하세요
        </Text>
        <Text className="text-sm text-gray-400 dark:text-gray-500 mt-4">
          (개발 중)
        </Text>
      </View>
    </SafeAreaView>
  );
}
