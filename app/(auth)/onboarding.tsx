import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { AppInput } from '../../src/components/ui/AppInput';
import { AppButton } from '../../src/components/ui/AppButton';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppScreen } from '../../src/components/ui/AppScreen';
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
    <AppScreen title="Onboarding" contentStyle={styles.content}>
      <AppCard>
        <View style={styles.form}>
          <AppInput label="대학교" value={university} onChangeText={setUniversity} placeholder="OO대학교" />
          <AppInput label="학과" value={major} onChangeText={setMajor} placeholder="컴퓨터공학과" />
          <AppInput label="학년" value={grade} onChangeText={setGrade} placeholder="3학년" />
          <AppButton label="시작하기" onPress={handleSubmit} />
        </View>
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
  },
  form: {
    gap: 12,
  },
});
