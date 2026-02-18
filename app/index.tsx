import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';

export default function Index() {
  const { isAuthenticated, hasOnboarded } = useAuthStore();

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  if (!hasOnboarded) return <Redirect href="/(auth)/onboarding" />;

  return <Redirect href="/(tabs)" />;
}
