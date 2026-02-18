import { router } from 'expo-router';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTimetableStore } from '../../stores/timetableStore';
import { colors } from '../../theme/colors';
import { Weekday } from '../../types/models';

const days: Weekday[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export function TimetableGrid() {
  const classes = useTimetableStore((state) => state.classes);
  const slots = useTimetableStore((state) => state.slots);

  return (
    <View style={styles.wrapper}>
      {days.map((day) => (
        <View key={day} style={styles.dayColumn}>
          <Text style={styles.dayLabel}>{day}</Text>
          {slots
            .filter((slot) => slot.day === day)
            .sort((a, b) => a.startHour - b.startHour)
            .map((slot) => {
              const item = classes.find((course) => course.id === slot.classId);
              if (!item) return null;
              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[styles.classCard, { borderLeftColor: item.color }]}
                  onPress={() => router.push(`/class/${item.id}`)}
                >
                  <Text style={styles.classTitle} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.classMeta}>
                    {slot.startHour}:00-{slot.endHour}:00
                  </Text>
                </TouchableOpacity>
              );
            })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    gap: 8,
  },
  dayColumn: {
    flex: 1,
    gap: 8,
  },
  dayLabel: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  classCard: {
    minHeight: 70,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 5,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    justifyContent: 'space-between',
  },
  classTitle: {
    fontWeight: '700',
    fontSize: 12,
    color: colors.text,
  },
  classMeta: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
