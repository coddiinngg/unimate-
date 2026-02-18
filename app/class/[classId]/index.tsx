import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppCard } from '../../../src/components/ui/AppCard';
import { AppButton } from '../../../src/components/ui/AppButton';
import { colors } from '../../../src/theme/colors';
import { useTimetableStore } from '../../../src/stores/timetableStore';

export default function ClassDetailScreen() {
  const { classId } = useLocalSearchParams<{ classId: string }>();
  const classIdValue = Array.isArray(classId) ? classId[0] : classId;
  const classItem = useTimetableStore((state) => (classIdValue ? state.getClassById(classIdValue) : undefined));
  const slots = useTimetableStore((state) => (classIdValue ? state.getSlotsByClassId(classIdValue) : []));

  if (!classItem) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>수업을 찾을 수 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{classItem.name}</Text>
        <Text style={styles.subtitle}>{classItem.professor} · {classItem.location}</Text>

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
            <AppButton label="채팅" variant="secondary" onPress={() => router.push('/chat')} style={styles.action} />
            <AppButton label="문서" variant="secondary" onPress={() => router.push('/documents')} style={styles.action} />
            <AppButton label="문제" variant="secondary" onPress={() => router.push('/problems')} style={styles.action} />
            <AppButton label="회의" variant="secondary" onPress={() => router.push('/meeting')} style={styles.action} />
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
  subtitle: { color: colors.textMuted },
  sectionTitle: { fontWeight: '700', color: colors.text, marginBottom: 8 },
  item: { color: colors.textMuted, marginTop: 4 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  action: { width: '48%' },
});
