import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';

const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: 'sparkles-outline',
  timetable: 'calendar-outline',
  tools: 'grid-outline',
  drive: 'folder-open-outline',
  profile: 'person-circle-outline',
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primaryStrong,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarStyle: {
          backgroundColor: '#F9FDFF',
          borderTopColor: colors.border,
          height: 66,
          paddingTop: 7,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={iconMap[route.name] ?? 'ellipse-outline'} size={size} color={color} />
        ),
      })}
    >
      <Tabs.Screen name="index" options={{ title: '홈' }} />
      <Tabs.Screen name="timetable" options={{ title: '시간표' }} />
      <Tabs.Screen name="tools" options={{ title: '도구' }} />
      <Tabs.Screen name="drive" options={{ title: '드라이브' }} />
      <Tabs.Screen name="profile" options={{ title: '프로필' }} />
    </Tabs>
  );
}
