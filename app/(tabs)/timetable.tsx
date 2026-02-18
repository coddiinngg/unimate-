import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../../src/components/ui/AppButton';
import { AppInput } from '../../src/components/ui/AppInput';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppScreen } from '../../src/components/ui/AppScreen';
import { Reveal } from '../../src/components/ui/Reveal';
import { TimetableGrid } from '../../src/components/timetable/TimetableGrid';
import { useTimetableStore } from '../../src/stores/timetableStore';
import { Weekday } from '../../src/types/models';
import { colors } from '../../src/theme/colors';

const dayTone = ['#EEF6FF', '#ECF7EF', '#F6EEFF', '#EAF7F8'];

export default function TimetableScreen() {
  const classes = useTimetableStore((state) => state.classes);
  const slots = useTimetableStore((state) => state.slots);
  const addClassWithSlot = useTimetableStore((state) => state.addClassWithSlot);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [day, setDay] = useState<Weekday>('Mon');
  const [startHour, setStartHour] = useState('9');
  const [endHour, setEndHour] = useState('10');
  const [addMode, setAddMode] = useState(false);
  const [selectedStart, setSelectedStart] = useState<{ day: Weekday; hour: number } | null>(null);
  const formSlide = useRef(new Animated.Value(16)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const parsedEndHour = Number(endHour);
  const previewEndHour = Number.isFinite(parsedEndHour) ? parsedEndHour : null;

  const todayTasks = useMemo(
    () => [...slots]
      .sort((a, b) => a.startHour - b.startHour)
      .map((slot, index) => {
        const item = classes.find((course) => course.id === slot.classId);
        if (!item) return null;
        return {
          id: slot.id,
          name: item.name,
          time: `${slot.startHour.toString().padStart(2, '0')}:00 - ${slot.endHour.toString().padStart(2, '0')}:00`,
          tone: dayTone[index % dayTone.length],
        };
      })
      .filter((item): item is { id: string; name: string; time: string; tone: string } => item !== null),
    [classes, slots],
  );

  const handleAddClass = () => {
    if (!name || !location) return;
    const parsedStart = Number(startHour);
    const parsedEnd = Number(endHour);
    if (!Number.isFinite(parsedStart) || !Number.isFinite(parsedEnd)) return;
    if (parsedEnd <= parsedStart) return;
    addClassWithSlot({
      name,
      professor: '미정',
      location,
      day,
      startHour: parsedStart,
      endHour: parsedEnd,
    });
    setName('');
    setLocation('');
    setAddMode(false);
    setSelectedStart(null);
  };

  useEffect(() => {
    if (!(addMode && selectedStart)) return;
    formSlide.setValue(16);
    formOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(formSlide, {
        toValue: 0,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [addMode, selectedStart, formOpacity, formSlide]);

  return (
    <AppScreen scroll title="Timeline" contentStyle={styles.screenContent}>
      <Reveal delay={70}>
        <AppCard>
          <View style={styles.timelineTopRight}>
            <Pressable
              style={[styles.addButton, addMode ? styles.addButtonActive : null]}
              onPress={() => {
                setAddMode((prev) => !prev);
                setSelectedStart(null);
              }}
            >
              <Ionicons name={addMode ? 'close-outline' : 'add-outline'} size={20} color={addMode ? '#FFFFFF' : colors.primaryStrong} />
            </Pressable>
          </View>
          {addMode && !selectedStart ? (
            <View style={styles.addModeHint}>
              <Text style={styles.addModeHintText}>추가할 시작 칸을 선택하세요</Text>
            </View>
          ) : null}
          <View style={[styles.gridTight, addMode ? styles.gridTightActive : null]}>
            <TimetableGrid
              addMode={addMode}
              selectedStart={selectedStart}
              previewEndHour={previewEndHour}
              onCellPress={(selectedDay, selectedHour) => {
                setDay(selectedDay);
                setStartHour(String(selectedHour));
                setEndHour(String(selectedHour + 1));
                setSelectedStart({ day: selectedDay, hour: selectedHour });
              }}
            />
          </View>
          {addMode && selectedStart ? (
            <Animated.View
              style={[
                styles.formWrap,
                {
                  opacity: formOpacity,
                  transform: [{ translateY: formSlide }],
                },
              ]}
            >
              <Text style={styles.startHint}>
                시작 시간: {selectedStart.day} {selectedStart.hour.toString().padStart(2, '0')}:00
              </Text>
              <View style={styles.form}>
                <AppInput label="수업명" value={name} onChangeText={setName} placeholder="자료구조" />
                <AppInput label="강의실" value={location} onChangeText={setLocation} placeholder="인문관 102" />
                <View style={styles.timeRow}>
                  <View style={styles.timeCol}>
                    <AppInput label="종료" value={endHour} onChangeText={setEndHour} keyboardType="numeric" />
                  </View>
                </View>
                <AppButton label="추가" onPress={handleAddClass} />
              </View>
            </Animated.View>
          ) : null}
        </AppCard>
      </Reveal>

      <Reveal delay={130}>
        <AppCard>
          <Text style={styles.sectionTitle}>Today tasks</Text>
          <View style={styles.tasksWrap}>
            {todayTasks.length === 0 ? <Text style={styles.empty}>등록된 수업이 없습니다.</Text> : null}
            {todayTasks.map((task) => (
              <View key={task.id} style={[styles.taskCard, { backgroundColor: task.tone }]}>
                <View>
                  <Text style={styles.taskTime}>{task.time}</Text>
                  <Text style={styles.taskName}>{task.name}</Text>
                </View>
                <View style={styles.callIcon}>
                  <Ionicons name="call-outline" size={14} color={colors.text} />
                </View>
              </View>
            ))}
          </View>
        </AppCard>
      </Reveal>

    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingTop: 4,
  },
  timelineTopRight: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  addButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.primarySoft,
  },
  addButtonActive: {
    borderColor: colors.primaryStrong,
    backgroundColor: colors.primaryStrong,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  addModeHint: {
    marginBottom: 8,
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  addModeHintText: {
    color: colors.primaryStrong,
    fontSize: 12,
    fontWeight: '700',
  },
  gridTight: {
    width: '100%',
    alignSelf: 'center',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D4D9E4',
  },
  gridTightActive: {
    borderColor: colors.primaryStrong,
    borderWidth: 2,
  },
  formWrap: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  startHint: {
    marginTop: 6,
    marginBottom: 10,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  tasksWrap: {
    gap: 9,
  },
  taskCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E9ECF3',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskTime: {
    color: colors.textSubtle,
    fontSize: 12,
    fontWeight: '700',
  },
  taskName: {
    marginTop: 3,
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  callIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 4,
  },
  form: {
    gap: 10,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  timeCol: {
    flex: 1,
  },
});
