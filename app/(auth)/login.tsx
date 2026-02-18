import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppInput } from '../../src/components/ui/AppInput';
import { AppButton } from '../../src/components/ui/AppButton';
import { colors } from '../../src/theme/colors';
import { useAuthStore } from '../../src/stores/authStore';

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const next: typeof errors = {};
    if (!email) next.email = '이메일을 입력해주세요.';
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = '이메일 형식이 올바르지 않습니다.';
    if (!password) next.password = '비밀번호를 입력해주세요.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      login({ email });
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('로그인 실패', error?.message ?? '다시 시도해주세요.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.wrapper}>
        <View style={styles.header}>
          <Text style={styles.logo}>UniMate</Text>
          <Text style={styles.subtitle}>시간표 중심 AI 생산성 앱</Text>
        </View>

        <View style={styles.form}>
          <AppInput
            label="이메일"
            placeholder="university@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
          />
          <AppInput
            label="비밀번호"
            placeholder="비밀번호"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            error={errors.password}
          />
          <AppButton label="로그인" onPress={handleLogin} />
          <AppButton label="회원가입" variant="secondary" onPress={() => router.push('/(auth)/register')} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  wrapper: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  header: { gap: 8, marginBottom: 28 },
  logo: { fontSize: 38, fontWeight: '800', color: colors.primary },
  subtitle: { fontSize: 15, color: colors.textMuted },
  form: { gap: 14 },
});
