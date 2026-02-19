import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppButton } from '../../src/components/ui/AppButton';
import { AppInput } from '../../src/components/ui/AppInput';
import { AppScreen } from '../../src/components/ui/AppScreen';
import { clearOpenAIKey, getOpenAIKey, saveOpenAIKey } from '../../src/services/ai/openaiConnection';
import { colors } from '../../src/theme/colors';
import { useAuthStore } from '../../src/stores/authStore';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [loadingKey, setLoadingKey] = useState(false);

  const maskedKey = useMemo(() => {
    if (!savedKey) return '연결 안 됨';
    if (savedKey.length < 10) return '저장됨';
    return `${savedKey.slice(0, 7)}...${savedKey.slice(-4)}`;
  }, [savedKey]);

  useEffect(() => {
    let mounted = true;
    const loadKey = async () => {
      const key = await getOpenAIKey();
      if (!mounted) return;
      setSavedKey(key);
    };
    loadKey();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSaveKey = async () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed) {
      Alert.alert('입력 필요', 'OpenAI API 키를 입력해주세요.');
      return;
    }
    setLoadingKey(true);
    try {
      await saveOpenAIKey(trimmed);
      const key = await getOpenAIKey();
      setSavedKey(key);
      setApiKeyInput('');
      Alert.alert('저장 완료', 'GPT 연결 키를 저장했습니다.');
    } finally {
      setLoadingKey(false);
    }
  };

  const handleClearKey = async () => {
    setLoadingKey(true);
    try {
      await clearOpenAIKey();
      setSavedKey(null);
      setApiKeyInput('');
      Alert.alert('해제 완료', 'GPT 연결 키를 삭제했습니다.');
    } finally {
      setLoadingKey(false);
    }
  };

  return (
    <AppScreen title="Profile" scroll>
      <AppCard>
        <Text style={styles.name}>{user?.name ?? '이름 없음'}</Text>
        <View style={styles.infoWrap}>
          <Text style={styles.row}>이메일: {user?.email ?? '-'}</Text>
          <Text style={styles.row}>대학교: {user?.university ?? '-'}</Text>
          <Text style={styles.row}>학과: {user?.major ?? '-'}</Text>
          <Text style={styles.row}>학년: {user?.grade ?? '-'}</Text>
        </View>
      </AppCard>

      <AppCard>
        <Text style={styles.sectionTitle}>GPT 연결</Text>
        <Text style={styles.row}>상태: {savedKey ? '연결됨' : '연결 안 됨'}</Text>
        <Text style={styles.row}>저장 키: {maskedKey}</Text>
        <Text style={styles.hint}>
          ChatGPT 계정 로그인 연동 대신 OpenAI API 키 기반으로 연결됩니다.
        </Text>
        <View style={styles.keyForm}>
          <AppInput
            label="OpenAI API Key"
            value={apiKeyInput}
            onChangeText={setApiKeyInput}
            placeholder="sk-..."
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.keyActions}>
            <AppButton label="키 저장" onPress={handleSaveKey} disabled={loadingKey} />
            <AppButton label="연결 해제" variant="secondary" onPress={handleClearKey} disabled={loadingKey || !savedKey} />
          </View>
        </View>
      </AppCard>

      <AppButton label="로그아웃" variant="danger" onPress={logout} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  name: {
    fontSize: 21,
    fontWeight: '900',
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  infoWrap: {
    marginTop: 10,
    gap: 3,
  },
  row: {
    color: colors.textMuted,
    lineHeight: 21,
  },
  hint: {
    marginTop: 8,
    color: colors.textSubtle,
    fontSize: 12,
    lineHeight: 18,
  },
  keyForm: {
    marginTop: 10,
    gap: 10,
  },
  keyActions: {
    flexDirection: 'row',
    gap: 8,
  },
});
