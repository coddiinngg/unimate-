import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppScreen } from '../../src/components/ui/AppScreen';
import { colors } from '../../src/theme/colors';
import { useTimetableStore } from '../../src/stores/timetableStore';
import { useDocumentStore } from '../../src/stores/documentStore';
import { useProblemStore } from '../../src/stores/problemStore';
import { useMeetingStore } from '../../src/stores/meetingStore';
import { useVideoSummaryStore } from '../../src/stores/videoSummaryStore';
import { useSlidesStore } from '../../src/stores/slidesStore';
import { useDesignerStore } from '../../src/stores/designerStore';
import { useDriveStore } from '../../src/stores/driveStore';

type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';

type MaterialItem = {
  id: string;
  type: 'doc' | 'problem' | 'meeting' | 'video' | 'slides' | 'design' | 'drive';
  title: string;
  createdAt: string;
};

const jsToWeekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

function toDateTime(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

function typeLabel(type: MaterialItem['type']) {
  if (type === 'doc') return '문서';
  if (type === 'problem') return '문제';
  if (type === 'meeting') return '회의';
  if (type === 'video') return '영상';
  if (type === 'slides') return '슬라이드';
  if (type === 'design') return '디자인';
  return '파일';
}

function weekdayLabel(day: Weekday | null) {
  if (day === 'Mon') return 'MON';
  if (day === 'Tue') return 'TUE';
  if (day === 'Wed') return 'WED';
  if (day === 'Thu') return 'THU';
  if (day === 'Fri') return 'FRI';
  return 'WEEKEND';
}

export default function HomeScreen() {
  const classes = useTimetableStore((state) => state.classes);
  const slots = useTimetableStore((state) => state.slots);

  const documents = useDocumentStore((state) => state.documents);
  const problemSets = useProblemStore((state) => state.sets);
  const meetings = useMeetingStore((state) => state.meetings);
  const videoSummaries = useVideoSummaryStore((state) => state.summaries);
  const decks = useSlidesStore((state) => state.decks);
  const designs = useDesignerStore((state) => state.designs);
  const driveFiles = useDriveStore((state) => state.files);

  const now = new Date();
  const currentWeekday = jsToWeekday[now.getDay()];
  const todayWeekday: Weekday | null =
    currentWeekday === 'Mon' || currentWeekday === 'Tue' || currentWeekday === 'Wed' || currentWeekday === 'Thu' || currentWeekday === 'Fri'
      ? currentWeekday
      : null;

  const todayTimeline = useMemo(() => {
    if (!todayWeekday) return [];

    return slots
      .filter((slot) => slot.day === todayWeekday)
      .map((slot) => {
        const course = classes.find((item) => item.id === slot.classId);
        if (!course) return null;

        const materials: MaterialItem[] = [
          ...documents
            .filter((item) => item.classId === course.id)
            .map((item) => ({ id: item.id, type: 'doc' as const, title: item.title, createdAt: item.updatedAt || item.createdAt })),
          ...problemSets
            .filter((item) => item.classId === course.id)
            .map((item) => ({ id: item.id, type: 'problem' as const, title: item.title, createdAt: item.createdAt })),
          ...meetings
            .filter((item) => item.classId === course.id)
            .map((item) => ({ id: item.id, type: 'meeting' as const, title: item.title, createdAt: item.createdAt })),
          ...videoSummaries
            .filter((item) => item.classId === course.id)
            .map((item) => ({ id: item.id, type: 'video' as const, title: item.videoId, createdAt: item.createdAt })),
          ...decks
            .filter((item) => item.classId === course.id)
            .map((item) => ({ id: item.id, type: 'slides' as const, title: item.title, createdAt: item.createdAt })),
          ...designs
            .filter((item) => item.classId === course.id)
            .map((item) => ({ id: item.id, type: 'design' as const, title: item.title, createdAt: item.createdAt })),
          ...driveFiles
            .filter((item) => item.classId === course.id)
            .map((item) => ({ id: item.id, type: 'drive' as const, title: item.name, createdAt: item.createdAt })),
        ]
          .sort((a, b) => toDateTime(b.createdAt) - toDateTime(a.createdAt))
          .slice(0, 2);

        return {
          classId: course.id,
          name: course.name,
          location: course.location,
          startHour: slot.startHour,
          endHour: slot.endHour,
          materials,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => a.startHour - b.startHour);
  }, [classes, decks, designs, documents, driveFiles, meetings, problemSets, slots, todayWeekday, videoSummaries]);

  return (
    <AppScreen scroll contentStyle={styles.content}>
      <AppCard>
        <View style={styles.timelineHeader}>
          <Text style={styles.dayText}>{weekdayLabel(todayWeekday)}</Text>
          <Pressable onPress={() => router.push('/(tabs)/timetable')}>
            <Text style={styles.linkText}>시간표</Text>
          </Pressable>
        </View>

        <View style={styles.trackWrap}>
          <View style={styles.trackLine} />

          <View style={styles.itemsWrap}>
            {todayTimeline.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>오늘 수업 없음</Text>
              </View>
            ) : null}

            {todayTimeline.map((item) => (
              <Pressable key={`${item.classId}-${item.startHour}`} style={styles.classCard} onPress={() => router.push(`/class/${item.classId}`)}>
                <View style={styles.classHead}>
                  <Text style={styles.className}>{item.name}</Text>
                  <Text style={styles.classTime}>
                    {item.startHour.toString().padStart(2, '0')}:00 - {item.endHour.toString().padStart(2, '0')}:00
                  </Text>
                </View>
                <Text style={styles.classLocation}>{item.location}</Text>

                <View style={styles.metaRow}>
                  {item.materials.length === 0 ? (
                    <Text style={styles.metaText}>최근 자료 없음</Text>
                  ) : (
                    item.materials.map((m) => (
                      <View key={m.id} style={styles.metaChip}>
                        <Text style={styles.metaType}>{typeLabel(m.type)}</Text>
                        <Text numberOfLines={1} style={styles.metaTitle}>{m.title}</Text>
                      </View>
                    ))
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 4,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayText: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  linkText: {
    color: colors.primaryStrong,
    fontSize: 12,
    fontWeight: '800',
  },
  trackWrap: {
    flexDirection: 'row',
    gap: 10,
  },
  trackLine: {
    width: 3,
    borderRadius: 99,
    backgroundColor: '#D8DEEC',
    marginTop: 6,
    marginBottom: 6,
  },
  itemsWrap: {
    flex: 1,
    gap: 10,
  },
  emptyCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#F7F9FF',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  classCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D8DEEC',
    backgroundColor: '#F3F5FB',
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 4,
  },
  classHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  className: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
  },
  classTime: {
    color: colors.textSubtle,
    fontSize: 11,
    fontWeight: '700',
  },
  classLocation: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  metaRow: {
    gap: 6,
  },
  metaText: {
    color: colors.textSubtle,
    fontSize: 11,
    fontWeight: '700',
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E7F3',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  metaType: {
    color: colors.primaryStrong,
    fontSize: 10,
    fontWeight: '800',
    minWidth: 32,
  },
  metaTitle: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
});
