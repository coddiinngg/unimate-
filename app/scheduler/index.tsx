import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useLocalSearchParams } from 'expo-router';
import { AppButton } from '../../src/components/ui/AppButton';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppInput } from '../../src/components/ui/AppInput';
import { AppScreen } from '../../src/components/ui/AppScreen';
import { runAiTask } from '../../src/services/ai/aiRouter';
import { useSchedulerStore } from '../../src/stores/schedulerStore';
import { useTimetableStore } from '../../src/stores/timetableStore';
import { colors } from '../../src/theme/colors';

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

const weekdayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

function toDateString(baseDate: Date, targetWeekday: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri') {
  const base = new Date(baseDate);
  const current = weekdayMap[base.getDay()];
  const order = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5 } as const;
  const currentOrder = current in order ? order[current as keyof typeof order] : 1;
  const diff = order[targetWeekday] - currentOrder;
  base.setDate(base.getDate() + diff);
  return base.toISOString().slice(0, 10);
}

export default function SchedulerScreen() {
  const { classId } = useLocalSearchParams<{ classId?: string }>();
  const linkedClassId = Array.isArray(classId) ? classId[0] : classId;

  const classes = useTimetableStore((state) => state.classes);
  const slots = useTimetableStore((state) => state.slots);

  const events = useSchedulerStore((state) => state.events);
  const addEvent = useSchedulerStore((state) => state.addEvent);
  const removeEvent = useSchedulerStore((state) => state.removeEvent);
  const recommendationsByDate = useSchedulerStore((state) => state.recommendationsByDate);
  const setRecommendation = useSchedulerStore((state) => state.setRecommendation);

  const [selectedDate, setSelectedDate] = useState(todayYmd());
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(undefined);
  const [type, setType] = useState<'class' | 'assignment' | 'exam' | 'meeting' | 'personal'>('assignment');
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    if (!linkedClassId) return;
    if (selectedClassId) return;
    if (classes.some((item) => item.id === linkedClassId)) {
      setSelectedClassId(linkedClassId);
    }
  }, [classes, linkedClassId, selectedClassId]);

  const selectedEvents = useMemo(
    () => events
      .filter((item) => item.date === selectedDate)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [events, selectedDate],
  );

  const markedDates = useMemo(() => {
    const marked: Record<string, any> = {
      [selectedDate]: {
        selected: true,
        selectedColor: colors.primaryStrong,
      },
    };

    for (const event of events) {
      marked[event.date] = {
        ...(marked[event.date] || {}),
        marked: true,
        dotColor: colors.primaryStrong,
      };
    }

    return marked;
  }, [events, selectedDate]);

  const addManualEvent = () => {
    if (!title.trim()) {
      Alert.alert('입력 필요', '일정 제목을 입력해주세요.');
      return;
    }

    addEvent({
      classId: selectedClassId,
      title: title.trim(),
      date: selectedDate,
      startTime,
      endTime,
      type,
    });

    setTitle('');
  };

  const importTimetableForSelectedDate = () => {
    const created = slots
      .map((slot) => {
        const date = toDateString(new Date(selectedDate), slot.day);
        const classItem = classes.find((item) => item.id === slot.classId);
        if (!classItem) return null;

        return addEvent({
          classId: classItem.id,
          title: `${classItem.name} 수업`,
          date,
          startTime: `${slot.startHour.toString().padStart(2, '0')}:00`,
          endTime: `${slot.endHour.toString().padStart(2, '0')}:00`,
          type: 'class',
          note: classItem.location,
        });
      })
      .filter(Boolean).length;

    Alert.alert('가져오기 완료', `${created}개의 수업 일정을 추가했습니다.`);
  };

  const generateAiRecommendation = async () => {
    setLoadingAi(true);
    try {
      const payload = selectedEvents
        .map((event) => `${event.startTime}-${event.endTime} [${event.type}] ${event.title}`)
        .join('\n');

      const prompt = [
        `날짜: ${selectedDate}`,
        '아래 일정을 보고 시간 관리 추천을 작성해줘.',
        '- 우선순위 3개',
        '- 쉬는 시간 배치',
        '- 마감 리스크 경고',
        '',
        payload || '등록 일정 없음',
      ].join('\n');

      const result = await runAiTask('summary', prompt);
      setRecommendation(selectedDate, result.output || '추천 결과가 비어 있습니다.');
    } catch (error) {
      const message = error instanceof Error ? error.message : '추천 생성 중 오류가 발생했습니다.';
      Alert.alert('AI 오류', message);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <AppScreen scroll title="Scheduler" showBack contentStyle={styles.content}>
      <AppCard>
        <Calendar
          current={selectedDate}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          theme={{
            selectedDayBackgroundColor: colors.primaryStrong,
            todayTextColor: colors.primaryStrong,
            arrowColor: colors.primaryStrong,
          }}
        />
      </AppCard>

      <AppCard>
        <Text style={styles.sectionTitle}>일정 추가 ({selectedDate})</Text>
        <AppInput label="제목" value={title} onChangeText={setTitle} placeholder="예: OS 과제 제출" />
        <View style={styles.row}>
          <View style={styles.col}><AppInput label="시작" value={startTime} onChangeText={setStartTime} placeholder="09:00" /></View>
          <View style={styles.col}><AppInput label="종료" value={endTime} onChangeText={setEndTime} placeholder="10:00" /></View>
        </View>

        <Text style={styles.label}>유형</Text>
        <View style={styles.rowWrap}>
          {(['assignment', 'exam', 'meeting', 'personal'] as const).map((item) => (
            <Text key={item} style={[styles.chip, type === item ? styles.chipActive : null]} onPress={() => setType(item)}>
              {item}
            </Text>
          ))}
        </View>

        <Text style={styles.label}>수업 연결</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowScroll}>
          <Text style={[styles.chip, !selectedClassId ? styles.chipActive : null]} onPress={() => setSelectedClassId(undefined)}>연결 안 함</Text>
          {classes.map((item) => (
            <Text key={item.id} style={[styles.chip, selectedClassId === item.id ? styles.chipActive : null]} onPress={() => setSelectedClassId(item.id)}>
              {item.name}
            </Text>
          ))}
        </ScrollView>

        <View style={styles.rowButtons}>
          <AppButton label="일정 추가" onPress={addManualEvent} />
          <AppButton label="시간표 가져오기" variant="secondary" onPress={importTimetableForSelectedDate} />
        </View>
      </AppCard>

      <AppCard>
        <View style={styles.headRow}>
          <Text style={styles.sectionTitle}>당일 일정</Text>
          <AppButton label={loadingAi ? '추천 생성 중' : 'AI 추천'} size="sm" onPress={generateAiRecommendation} disabled={loadingAi} />
        </View>

        <View style={styles.eventList}>
          {selectedEvents.length === 0 ? <Text style={styles.empty}>등록된 일정이 없습니다.</Text> : null}
          {selectedEvents.map((event) => (
            <View key={event.id} style={styles.eventItem}>
              <Text style={styles.eventTitle}>{event.startTime} - {event.endTime} · {event.title}</Text>
              <Text style={styles.eventMeta}>{event.type}{event.note ? ` · ${event.note}` : ''}</Text>
              <AppButton label="삭제" size="sm" variant="danger" onPress={() => removeEvent(event.id)} />
            </View>
          ))}
        </View>

        <Text style={styles.recTitle}>AI 추천 결과</Text>
        <Text style={styles.recBody}>{recommendationsByDate[selectedDate] || '없음'}</Text>
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 6 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  row: { flexDirection: 'row', gap: 8 },
  col: { flex: 1 },
  label: { marginTop: 8, marginBottom: 6, color: colors.textSubtle, fontSize: 12, fontWeight: '700' },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  rowScroll: { gap: 8, marginBottom: 8 },
  chip: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1,
    borderColor: colors.borderStrong, color: colors.textMuted, fontSize: 12, fontWeight: '700', backgroundColor: colors.surface,
  },
  chipActive: { borderColor: colors.primaryStrong, color: colors.primaryStrong, backgroundColor: colors.primarySoft },
  rowButtons: { flexDirection: 'row', gap: 8 },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eventList: { marginTop: 10, gap: 8 },
  eventItem: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 10, backgroundColor: colors.surface,
  },
  eventTitle: { color: colors.text, fontSize: 13, fontWeight: '700' },
  eventMeta: { marginTop: 4, marginBottom: 8, color: colors.textMuted, fontSize: 12 },
  recTitle: { marginTop: 12, color: colors.text, fontSize: 13, fontWeight: '800' },
  recBody: { marginTop: 6, color: colors.textMuted, fontSize: 13, lineHeight: 20 },
  empty: { color: colors.textMuted, fontSize: 13 },
});
