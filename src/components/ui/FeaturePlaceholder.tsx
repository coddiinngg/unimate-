import { StyleSheet, Text, View } from 'react-native';
import { AppCard } from './AppCard';
import { AppScreen } from './AppScreen';
import { Reveal } from './Reveal';
import { colors } from '../../theme/colors';

interface Props {
  title: string;
  body: string;
  badge?: string;
}

export function FeaturePlaceholder({ title, body, badge = 'Coming Soon' }: Props) {
  return (
    <AppScreen title={title}>
      <Reveal delay={70}>
        <AppCard>
          <View style={styles.badgeWrap}>
            <Text style={styles.badge}>{badge}</Text>
          </View>
          <Text style={styles.body}>{body}</Text>
        </AppCard>
      </Reveal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  badgeWrap: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentSoft,
    borderColor: '#F8D68A',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badge: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  body: {
    marginTop: 12,
    color: colors.textMuted,
    lineHeight: 22,
    fontSize: 14,
  },
});
