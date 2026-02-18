import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppInput } from '../../src/components/ui/AppInput';
import { AppButton } from '../../src/components/ui/AppButton';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppScreen } from '../../src/components/ui/AppScreen';
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
    <AppScreen title="Register" contentStyle={styles.content}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <AppCard>
            <View style={styles.form}>
              <Text style={styles.formTitle}>새 계정 만들기</Text>
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
            </View>
          </AppCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 8,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 24,
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
