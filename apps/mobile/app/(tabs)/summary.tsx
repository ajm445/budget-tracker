import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';

export default function SummaryScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['bottom']}>
      <ScrollView className="flex-1 px-4 py-4">
        {/* 잔액 카드 */}
        <View className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-4 shadow-sm">
          <Text className="text-gray-500 dark:text-gray-400 text-sm mb-1">
            이번 달 잔액
          </Text>
          <Text className="text-3xl font-bold text-gray-900 dark:text-white">
            ₩0
          </Text>
          <View className="flex-row mt-4 space-x-4">
            <View className="flex-1">
              <Text className="text-xs text-gray-500 dark:text-gray-400">수입</Text>
              <Text className="text-lg font-semibold text-green-600">₩0</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500 dark:text-gray-400">지출</Text>
              <Text className="text-lg font-semibold text-red-600">₩0</Text>
            </View>
          </View>
        </View>

        {/* 최근 거래 */}
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            최근 거래
          </Text>
          <View className="items-center py-8">
            <Text className="text-gray-500 dark:text-gray-400">
              거래 내역이 없습니다
            </Text>
            <Text className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              + 버튼을 눌러 첫 거래를 추가하세요
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full items-center justify-center shadow-lg"
        onPress={() => {
          // TODO: Open transaction form modal
        }}
      >
        <Plus size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
