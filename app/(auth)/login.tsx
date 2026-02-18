import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppInput } from '../../src/components/ui/AppInput';
import { AppButton } from '../../src/components/ui/AppButton';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppScreen } from '../../src/components/ui/AppScreen';
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '다시 시도해주세요.';
      Alert.alert('로그인 실패', message);
    }
  };

  return (
    <AppScreen title="Login" contentStyle={styles.content}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <AppCard>
          <View style={styles.form}>
            <Text style={styles.formTitle}>로그인</Text>
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
        </AppCard>
      </KeyboardAvoidingView>
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
  formTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 2,
  },
});
