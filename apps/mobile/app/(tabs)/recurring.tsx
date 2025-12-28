import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RecurringScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['bottom']}>
      <View className="flex-1 items-center justify-center px-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          고정지출
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-center">
          매월 반복되는 고정 지출을 관리하세요
        </Text>
        <Text className="text-sm text-gray-400 dark:text-gray-500 mt-4">
          (개발 중)
        </Text>
      </View>
    </SafeAreaView>
  );
}
