import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppCard } from '../../src/components/ui/AppCard';
import { colors } from '../../src/theme/colors';

export default function ProblemsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>AI 문제 생성</Text>
        <AppCard><Text style={styles.body}>Phase 5 예정: 문제 생성/채점/해설.</Text></AppCard>
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
