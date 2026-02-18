import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppButton } from '../../src/components/ui/AppButton';
import { colors } from '../../src/theme/colors';
import { useAuthStore } from '../../src/stores/authStore';
import { useTimetableStore } from '../../src/stores/timetableStore';
import { router } from 'expo-router';

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const classes = useTimetableStore((state) => state.classes);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>안녕하세요, {user?.name ?? '학생'}님</Text>
        <Text style={styles.subtitle}>오늘도 수업 중심으로 학습 흐름을 정리해보세요.</Text>

        <AppCard>
          <Text style={styles.cardTitle}>이번 학기 수업</Text>
          <Text style={styles.cardBody}>{classes.length}개 수업이 등록되어 있습니다.</Text>
          <AppButton label="시간표 보기" onPress={() => router.push('/(tabs)/timetable')} style={styles.cardButton} />
        </AppCard>

        <AppCard>
          <Text style={styles.cardTitle}>빠른 실행</Text>
          <View style={styles.quickRow}>
            <AppButton label="AI 채팅" onPress={() => router.push('/chat')} variant="secondary" style={styles.quickButton} />
            <AppButton label="회의 요약" onPress={() => router.push('/meeting')} variant="secondary" style={styles.quickButton} />
          </View>
        </AppCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 12 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { color: colors.textMuted, marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  cardBody: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  cardButton: { marginTop: 12 },
  quickRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  quickButton: { flex: 1 },
});
