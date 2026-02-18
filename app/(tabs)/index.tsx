import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppButton } from '../../src/components/ui/AppButton';
import { AppScreen } from '../../src/components/ui/AppScreen';
import { Reveal } from '../../src/components/ui/Reveal';
import { colors } from '../../src/theme/colors';
import { useAuthStore } from '../../src/stores/authStore';
import { useTimetableStore } from '../../src/stores/timetableStore';

const categoryCards = [
  { title: 'Mobile App', tasks: '10 Tasks', tone: '#FDF1DE', icon: 'phone-portrait-outline' as const },
  { title: 'Website', tasks: '05 Tasks', tone: '#EAF4E8', icon: 'globe-outline' as const },
];

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const classes = useTimetableStore((state) => state.classes);

  return (
    <AppScreen scroll title="Home">
      <Reveal delay={20}>
        <View style={styles.headRow}>
          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={16} color={colors.textSubtle} />
            <TextInput style={styles.searchInput} placeholder="Search" placeholderTextColor={colors.textSubtle} />
          </View>
          <View style={styles.iconBtn}>
            <Ionicons name="options-outline" size={17} color="#FFFFFF" />
          </View>
        </View>
      </Reveal>

      <Reveal delay={80}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoryRow}>
          {categoryCards.map((item) => (
            <View key={item.title} style={[styles.categoryCard, { backgroundColor: item.tone }]}>
              <Text style={styles.categoryTitle}>{item.title}</Text>
              <Text style={styles.categoryTasks}>{item.tasks}</Text>
              <View style={styles.categoryIcon}>
                <Ionicons name={item.icon} size={18} color={colors.text} />
              </View>
            </View>
          ))}
        </View>
      </Reveal>

      <Reveal delay={150}>
        <View style={styles.ongoingTitleRow}>
          <Text style={styles.sectionTitle}>Ongoing tasks</Text>
          <Text style={styles.seeAll}>See all</Text>
        </View>
        <AppCard>
          <Text style={styles.taskTitle}>Wallet App Design</Text>
          <Text style={styles.taskMeta}>Team members · {user?.name ?? 'student'}</Text>
          <View style={styles.progressRow}>
            <Text style={styles.taskTime}>2:30 PM - 6:00 PM</Text>
            <View style={styles.progressBadge}><Text style={styles.progressText}>46%</Text></View>
          </View>
        </AppCard>
      </Reveal>

      <Reveal delay={220}>
        <AppCard>
          <Text style={styles.taskTitle}>Dashboard & Mobile App</Text>
          <Text style={styles.taskMeta}>Review and final polish</Text>
          <View style={styles.progressRow}>
            <Text style={styles.taskTime}>9:30 AM - 11:30 AM</Text>
            <View style={[styles.progressBadge, styles.progressBlue]}><Text style={styles.progressText}>76%</Text></View>
          </View>
          <AppButton label="시간표 열기" onPress={() => router.push('/(tabs)/timetable')} style={styles.openButton} />
        </AppCard>
      </Reveal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  searchWrap: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#F5F7FB',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0B0C11',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'AvenirNext-DemiBold', android: 'sans-serif-medium' }),
    color: colors.text,
    letterSpacing: -0.2,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
    paddingBottom: 2,
  },
  categoryCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 13,
    paddingVertical: 11,
    minHeight: 120,
  },
  categoryTitle: {
    color: colors.text,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'AvenirNext-DemiBold', android: 'sans-serif-medium' }),
    fontSize: 15,
  },
  categoryTasks: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
    fontFamily: Platform.select({ ios: 'AvenirNext-Medium', android: 'sans-serif' }),
  },
  categoryIcon: {
    marginTop: 'auto',
    alignSelf: 'flex-end',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ongoingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 6,
  },
  seeAll: {
    color: colors.textSubtle,
    fontSize: 11,
    fontWeight: '700',
  },
  taskTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'AvenirNext-DemiBold', android: 'sans-serif-medium' }),
  },
  taskMeta: {
    marginTop: 5,
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: Platform.select({ ios: 'AvenirNext-Medium', android: 'sans-serif' }),
  },
  progressRow: {
    marginTop: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTime: {
    color: colors.textSubtle,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'AvenirNext-DemiBold', android: 'sans-serif-medium' }),
  },
  progressBadge: {
    borderRadius: 999,
    backgroundColor: '#EEF0FA',
    borderWidth: 1,
    borderColor: '#DFE4F7',
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  progressBlue: {
    backgroundColor: '#E7EDFF',
    borderColor: '#D5DFFD',
  },
  progressText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '800',
  },
  openButton: {
    marginTop: 12,
  },
});
