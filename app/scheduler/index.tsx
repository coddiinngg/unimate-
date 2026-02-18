import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppCard } from '../../src/components/ui/AppCard';
import { colors } from '../../src/theme/colors';

export default function SchedulerScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>AI 스케줄러</Text>
        <AppCard><Text style={styles.body}>Phase 9 예정: 캘린더 + 일정 추천.</Text></AppCard>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  body: { color: colors.textMuted },
});
