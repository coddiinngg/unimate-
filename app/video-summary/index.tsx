import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppCard } from '../../src/components/ui/AppCard';
import { colors } from '../../src/theme/colors';

export default function VideoSummaryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>AI 동영상 요약</Text>
        <AppCard><Text style={styles.body}>Phase 4 예정: URL 입력 기반 요약 파이프라인.</Text></AppCard>
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
