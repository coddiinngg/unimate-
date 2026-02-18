import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: '홈' }} />
      <Tabs.Screen name="timetable" options={{ title: '시간표' }} />
      <Tabs.Screen name="tools" options={{ title: '도구' }} />
      <Tabs.Screen name="drive" options={{ title: '드라이브' }} />
      <Tabs.Screen name="profile" options={{ title: '프로필' }} />
    </Tabs>
  );
}
