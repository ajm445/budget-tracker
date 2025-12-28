import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CalendarScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['bottom']}>
      <View className="flex-1 items-center justify-center px-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          캘린더
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-center">
          월별 거래 내역을 캘린더에서 확인하세요
        </Text>
        <Text className="text-sm text-gray-400 dark:text-gray-500 mt-4">
          (개발 중)
        </Text>
      </View>
    </SafeAreaView>
  );
}
