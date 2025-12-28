import { Tabs } from 'expo-router';
import { Home, Calendar, PiggyBank, BarChart3, Repeat } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#4F46E5',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="summary"
        options={{
          title: '요약',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          headerTitle: '가계부',
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: '캘린더',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
          headerTitle: '캘린더',
        }}
      />
      <Tabs.Screen
        name="recurring"
        options={{
          title: '고정지출',
          tabBarIcon: ({ color, size }) => <Repeat size={size} color={color} />,
          headerTitle: '고정지출',
        }}
      />
      <Tabs.Screen
        name="savings"
        options={{
          title: '저축',
          tabBarIcon: ({ color, size }) => <PiggyBank size={size} color={color} />,
          headerTitle: '저축 목표',
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: '통계',
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
          headerTitle: '통계',
        }}
      />
    </Tabs>
  );
}
