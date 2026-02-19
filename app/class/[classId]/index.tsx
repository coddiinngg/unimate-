import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { AppCard } from '../../../src/components/ui/AppCard';
import { AppButton } from '../../../src/components/ui/AppButton';
import { AppScreen } from '../../../src/components/ui/AppScreen';
import { colors } from '../../../src/theme/colors';
import { useTimetableStore } from '../../../src/stores/timetableStore';

export default function ClassDetailScreen() {
  const { classId } = useLocalSearchParams<{ classId: string }>();
  const classIdValue = Array.isArray(classId) ? classId[0] : classId;
  const classItem = useTimetableStore((state) => (classIdValue ? state.getClassById(classIdValue) : undefined));
  const slots = useTimetableStore((state) => (classIdValue ? state.getSlotsByClassId(classIdValue) : []));

  if (!classItem) {
    return (
      <AppScreen title="Class">
        <AppCard>
          <Text style={styles.item}>수업 데이터가 없거나 삭제되었습니다.</Text>
        </AppCard>
      </AppScreen>
    );
  }

  return (
    <AppScreen
      scroll
      title="Class"
    >
      <AppCard>
        <Text style={styles.sectionTitle}>시간표 슬롯</Text>
        {slots.map((slot) => (
          <Text key={slot.id} style={styles.item}>
            {slot.day} {slot.startHour}:00-{slot.endHour}:00
          </Text>
        ))}
      </AppCard>

      <AppCard>
        <Text style={styles.sectionTitle}>연결된 AI 작업</Text>
        <View style={styles.actions}>
          <AppButton
            label="채팅"
            variant="secondary"
            onPress={() => router.push(`/chat?classId=${encodeURIComponent(classItem.id)}`)}
            style={styles.action}
          />
          <AppButton
            label="문서"
            variant="secondary"
            onPress={() => router.push(`/documents?classId=${encodeURIComponent(classItem.id)}`)}
            style={styles.action}
          />
          <AppButton
            label="문제"
            variant="secondary"
            onPress={() => router.push(`/problems?classId=${encodeURIComponent(classItem.id)}`)}
            style={styles.action}
          />
          <AppButton
            label="회의"
            variant="secondary"
            onPress={() => router.push(`/meeting?classId=${encodeURIComponent(classItem.id)}`)}
            style={styles.action}
          />
          <AppButton
            label="영상요약"
            variant="secondary"
            onPress={() => router.push(`/video-summary?classId=${encodeURIComponent(classItem.id)}`)}
            style={styles.action}
          />
          <AppButton
            label="슬라이드"
            variant="secondary"
            onPress={() => router.push(`/slides?classId=${encodeURIComponent(classItem.id)}`)}
            style={styles.action}
          />
          <AppButton
            label="디자이너"
            variant="secondary"
            onPress={() => router.push(`/designer?classId=${encodeURIComponent(classItem.id)}`)}
            style={styles.action}
          />
          <AppButton
            label="스케줄러"
            variant="secondary"
            onPress={() => router.push(`/scheduler?classId=${encodeURIComponent(classItem.id)}`)}
            style={styles.action}
          />
          <AppButton
            label="드라이브"
            variant="secondary"
            onPress={() => router.push(`/(tabs)/drive?classId=${encodeURIComponent(classItem.id)}`)}
            style={styles.action}
          />
        </View>
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontWeight: '800',
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  item: {
    color: colors.textMuted,
    lineHeight: 22,
  },
  actions: {
    marginTop: 3,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  action: {
    width: '48.5%',
  },
});
