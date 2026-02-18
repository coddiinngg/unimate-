import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../src/components/ui/AppButton';
import { AppInput } from '../../src/components/ui/AppInput';
import { AppCard } from '../../src/components/ui/AppCard';
import { TimetableGrid } from '../../src/components/timetable/TimetableGrid';
import { useTimetableStore } from '../../src/stores/timetableStore';
import { Weekday } from '../../src/types/models';
import { colors } from '../../src/theme/colors';

const dayOptions: Weekday[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export default function TimetableScreen() {
  const addClassWithSlot = useTimetableStore((state) => state.addClassWithSlot);
  const [name, setName] = useState('');
  const [professor, setProfessor] = useState('');
  const [location, setLocation] = useState('');
  const [day, setDay] = useState<Weekday>('Mon');
  const [startHour, setStartHour] = useState('9');
  const [endHour, setEndHour] = useState('10');

  const handleAddClass = () => {
    if (!name || !professor || !location) return;
    addClassWithSlot({
      name,
      professor,
      location,
      day,
      startHour: Number(startHour),
      endHour: Number(endHour),
    });
    setName('');
    setProfessor('');
    setLocation('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>시간표</Text>
        <Text style={styles.subtitle}>수업을 탭하면 관련 자료/AI 기능으로 이동합니다.</Text>

        <AppCard>
          <TimetableGrid />
        </AppCard>

        <AppCard>
          <Text style={styles.formTitle}>수업 추가</Text>
          <View style={styles.form}>
            <AppInput label="수업명" value={name} onChangeText={setName} placeholder="자료구조" />
            <AppInput label="교수명" value={professor} onChangeText={setProfessor} placeholder="박교수" />
            <AppInput label="강의실" value={location} onChangeText={setLocation} placeholder="인문관 102" />
            <AppInput label="시작 시각 (0-23)" value={startHour} onChangeText={setStartHour} keyboardType="numeric" />
            <AppInput label="종료 시각 (0-23)" value={endHour} onChangeText={setEndHour} keyboardType="numeric" />

            <View style={styles.dayPickerRow}>
              {dayOptions.map((candidate) => (
                <AppButton
                  key={candidate}
                  label={candidate}
                  variant={day === candidate ? 'primary' : 'secondary'}
                  style={styles.dayButton}
                  onPress={() => setDay(candidate)}
                />
              ))}
            </View>
            <AppButton label="추가" onPress={handleAddClass} />
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
  subtitle: { color: colors.textMuted, marginBottom: 4 },
  formTitle: { fontWeight: '700', fontSize: 16, color: colors.text, marginBottom: 8 },
  form: { gap: 10 },
  dayPickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dayButton: { minWidth: 58 },
});
