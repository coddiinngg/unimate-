import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppInput } from '../../src/components/ui/AppInput';
import { AppButton } from '../../src/components/ui/AppButton';
import { colors } from '../../src/theme/colors';
import { useAuthStore } from '../../src/stores/authStore';

export default function RegisterScreen() {
  const register = useAuthStore((state) => state.register);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [university, setUniversity] = useState('');

  const handleRegister = () => {
    if (!name || !email || !password) {
      Alert.alert('입력 오류', '필수 항목을 모두 입력해주세요.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('입력 오류', '비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    register({ email, name, university });
    router.replace('/(auth)/onboarding');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>회원가입</Text>
          <Text style={styles.subtitle}>기본 정보를 입력하세요.</Text>
          <AppInput label="이름" value={name} onChangeText={setName} placeholder="홍길동" />
          <AppInput
            label="이메일"
            value={email}
            onChangeText={setEmail}
            placeholder="university@email.com"
            autoCapitalize="none"
          />
          <AppInput label="대학교" value={university} onChangeText={setUniversity} placeholder="OO대학교" />
          <AppInput label="비밀번호" value={password} onChangeText={setPassword} secureTextEntry placeholder="6자 이상" />
          <AppButton label="가입하기" onPress={handleRegister} />
          <AppButton label="로그인으로 돌아가기" variant="secondary" onPress={() => router.replace('/(auth)/login')} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { gap: 14, padding: 20 },
  title: { fontSize: 30, fontWeight: '800', color: colors.text, marginTop: 20 },
  subtitle: { color: colors.textMuted, marginBottom: 8 },
});
