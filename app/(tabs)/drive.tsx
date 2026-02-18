import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppCard } from '../../src/components/ui/AppCard';
import { colors } from '../../src/theme/colors';

export default function DriveScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>AI 드라이브</Text>
        <AppCard>
          <Text style={styles.cardTitle}>구현 상태</Text>
          <Text style={styles.cardBody}>Phase 10 예정 기능입니다. 현재는 수업별 자동 폴더 구조를 위한 기본 화면만 제공됩니다.</Text>
        </AppCard>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  cardTitle: { fontWeight: '700', color: colors.text },
  cardBody: { marginTop: 4, color: colors.textMuted },
});
