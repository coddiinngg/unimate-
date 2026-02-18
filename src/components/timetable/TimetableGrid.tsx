import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTimetableStore } from '../../stores/timetableStore';
import { colors } from '../../theme/colors';
import { Weekday } from '../../types/models';

const days: Weekday[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const dayLabel: Record<Weekday, string> = { Mon: 'MON', Tue: 'TUE', Wed: 'WED', Thu: 'THUR', Fri: 'FRI' };
const defaultStartHour = 9;
const defaultEndHour = 16;
const gridLine = '#E4E9F1';
const headerHeight = 30;
const rowHeight = 46;
const timeColWidth = 40;
const blockColor = '#C5D3E6';

interface Props {
  addMode?: boolean;
  onCellPress?: (day: Weekday, hour: number) => void;
  selectedStart?: { day: Weekday; hour: number } | null;
  previewEndHour?: number | null;
}

export function TimetableGrid({ addMode, onCellPress, selectedStart, previewEndHour }: Props) {
  const classes = useTimetableStore((state) => state.classes);
  const slots = useTimetableStore((state) => state.slots);
  const minHour = Math.min(defaultStartHour, ...slots.map((slot) => slot.startHour));
  const maxHour = Math.max(defaultEndHour, ...slots.map((slot) => slot.endHour));
  const hours = Array.from({ length: maxHour - minHour + 1 }, (_, index) => minHour + index);

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <View style={styles.timeHeaderCell} />
        {days.map((day) => (
          <View key={day} style={styles.dayHeaderCell}>
            <Text style={styles.dayHeaderText}>{dayLabel[day]}</Text>
          </View>
        ))}
      </View>

      {hours.map((hour, rowIndex) => {
        const isLastRow = hour === maxHour;
        const isFirstRow = rowIndex === 0;
        return (
          <View key={hour} style={styles.timeRow}>
            <View style={[styles.timeCell, !isFirstRow ? styles.rowTopLine : null, isLastRow ? styles.lastRowCell : null]}>
              <Text style={styles.timeLabel}>{hour}</Text>
            </View>

            <View style={[styles.rowGrid, !isFirstRow ? styles.rowTopLine : null, isLastRow ? styles.lastRowCell : null]}>
              {days.map((day, dayIndex) => {
                const isLastDay = dayIndex === days.length - 1;
                const isSelectedStart = Boolean(selectedStart && selectedStart.day === day && selectedStart.hour === hour);
                const hasPreviewRange = Boolean(
                  addMode &&
                    selectedStart &&
                    previewEndHour &&
                    previewEndHour > selectedStart.hour &&
                    day === selectedStart.day &&
                    hour >= selectedStart.hour &&
                    hour < previewEndHour,
                );

                return (
                  <Pressable
                    key={`${day}-${hour}`}
                    style={[
                      styles.emptyCell,
                      !isLastDay ? styles.dayDivider : null,
                      hasPreviewRange ? styles.previewCell : null,
                      isSelectedStart ? styles.selectedStartCell : null,
                    ]}
                    onPress={() => {
                      if (addMode) onCellPress?.(day, hour);
                    }}
                  />
                );
              })}
            </View>
          </View>
        );
      })}

      <View pointerEvents={addMode ? 'none' : 'box-none'} style={styles.overlay}>
        <View style={styles.overlayRow}>
          {days.map((day) => (
            <View key={day} style={styles.overlayCol}>
              {slots
                .filter((slot) => slot.day === day)
                .map((slot) => {
                  const item = classes.find((course) => course.id === slot.classId);
                  if (!item) return null;

                  const top = (slot.startHour - minHour) * rowHeight + 1;
                  const duration = Math.max(1, slot.endHour - slot.startHour);
                  const height = duration * rowHeight;
                  return (
                    <Pressable
                      key={slot.id}
                      style={[styles.classBlockWrap, { top, height }]}
                      onPress={() => router.push(`/class/${item.id}`)}
                    >
                      <View style={[styles.classBlock, { backgroundColor: blockColor }]}>
                        <Text style={styles.classTitle} numberOfLines={2}>{item.name}</Text>
                      </View>
                    </Pressable>
                  );
                })}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    height: headerHeight,
    borderBottomWidth: 1,
    borderBottomColor: gridLine,
  },
  timeHeaderCell: {
    width: timeColWidth,
    borderRightWidth: 1,
    borderRightColor: gridLine,
  },
  dayHeaderCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 0.8,
    borderRightColor: '#EAEFF6',
  },
  dayHeaderText: {
    color: '#7F8898',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: rowHeight,
  },
  timeCell: {
    width: timeColWidth,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: gridLine,
  },
  rowTopLine: {
    borderTopWidth: 1,
    borderTopColor: gridLine,
  },
  timeLabel: {
    color: '#7F8898',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  rowGrid: {
    flex: 1,
    flexDirection: 'row',
  },
  emptyCell: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  dayDivider: {
    borderRightWidth: 0.8,
    borderRightColor: '#EAEFF6',
  },
  previewCell: {
    backgroundColor: '#F2F6FF',
  },
  selectedStartCell: {
    backgroundColor: '#E7EEFF',
  },
  lastRowCell: {
    borderBottomWidth: 1,
    borderBottomColor: gridLine,
  },
  overlay: {
    position: 'absolute',
    left: timeColWidth,
    right: 0,
    top: headerHeight,
    bottom: 0,
  },
  overlayRow: {
    flex: 1,
    flexDirection: 'row',
  },
  overlayCol: {
    flex: 1,
    position: 'relative',
  },
  classBlockWrap: {
    position: 'absolute',
    left: 2,
    right: 2,
    top: 2,
    paddingVertical: 0,
  },
  classBlock: {
    flex: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 0,
  },
  classTitle: {
    fontWeight: '700',
    fontSize: 11,
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 2,
  },
});
