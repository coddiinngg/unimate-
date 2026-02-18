import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppInput } from '../../src/components/ui/AppInput';
import { AppButton } from '../../src/components/ui/AppButton';
import { colors } from '../../src/theme/colors';
import { useAuthStore } from '../../src/stores/authStore';

export default function OnboardingScreen() {
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [grade, setGrade] = useState('');

  const handleSubmit = () => {
    completeOnboarding({ university, major, grade });
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>온보딩</Text>
        <Text style={styles.subtitle}>학업 정보를 설정하면 수업 중심 추천이 강화됩니다.</Text>
        <AppInput label="대학교" value={university} onChangeText={setUniversity} placeholder="OO대학교" />
        <AppInput label="학과" value={major} onChangeText={setMajor} placeholder="컴퓨터공학과" />
        <AppInput label="학년" value={grade} onChangeText={setGrade} placeholder="3학년" />
        <AppButton label="시작하기" onPress={handleSubmit} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: 20, justifyContent: 'center', gap: 12 },
  title: { fontSize: 30, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginBottom: 8 },
});
