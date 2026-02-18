import { StyleSheet, Text } from 'react-native';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppScreen } from '../../src/components/ui/AppScreen';
import { colors } from '../../src/theme/colors';

export default function DriveScreen() {
  return (
    <AppScreen title="Drive">
      <AppCard>
        <Text style={styles.cardTitle}>구현 상태</Text>
        <Text style={styles.cardBody}>Phase 10 예정 기능입니다. 현재는 수업별 자동 폴더 구조를 위한 기본 화면을 제공합니다.</Text>
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  cardTitle: {
    fontWeight: '800',
    color: colors.text,
    fontSize: 17,
  },
  cardBody: {
    marginTop: 8,
    color: colors.textMuted,
    lineHeight: 22,
  },
});
