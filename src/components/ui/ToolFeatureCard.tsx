import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, shadow } from '../../theme/colors';

interface Props {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: string;
  badge?: string;
  onPress: () => void;
}

export function ToolFeatureCard({ title, subtitle, icon, tone, badge, onPress }: Props) {
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]} onPress={onPress}>
      <LinearGradient colors={[tone, '#FFFFFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.surface}>
        <View style={styles.topRow}>
          <Text numberOfLines={1} style={styles.title}>{title}</Text>
          <View style={styles.iconBubble}>
            <Ionicons name={icon} size={15} color={colors.text} />
          </View>
        </View>
        <Text numberOfLines={2} style={styles.subtitle}>{subtitle}</Text>
        <View style={styles.bottomRow}>
          {badge ? <Text style={styles.badge}>{badge}</Text> : <View />}
          <View style={styles.blob} />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E7F1',
    borderRadius: 20,
    minHeight: 144,
    overflow: 'hidden',
    ...shadow.card,
  },
  surface: {
    flex: 1,
    padding: 12,
  },
  cardPressed: {
    transform: [{ scale: 0.985 }, { translateY: 1 }],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },
  iconBubble: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(220,226,238,0.95)',
  },
  subtitle: {
    marginTop: 7,
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 17,
    minHeight: 36,
  },
  bottomRow: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  badge: {
    alignSelf: 'flex-start',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.2,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    color: '#434A57',
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(223,230,242,0.95)',
  },
  blob: {
    width: 40,
    height: 22,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.62)',
  },
});
