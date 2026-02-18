import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { useAuthStore } from '../src/stores/authStore';

export default function RootLayout() {
  const { isAuthenticated, hasOnboarded } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!hasOnboarded) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="class/[classId]" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="slides" />
        <Stack.Screen name="documents" />
        <Stack.Screen name="designer" />
        <Stack.Screen name="scheduler" />
        <Stack.Screen name="video-summary" />
        <Stack.Screen name="problems" />
        <Stack.Screen name="meeting" />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
