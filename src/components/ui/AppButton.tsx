import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, shadow } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'md' | 'sm';
  style?: ViewStyle;
}

export function AppButton({ label, onPress, disabled, variant = 'primary', size = 'md', style }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[size],
        variant === 'primary' ? shadow.button : null,
        pressed ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.label, styles[`label_${size}`], variant !== 'primary' ? styles.labelDark : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 13,
    borderWidth: 1,
  },
  md: {
    minHeight: 38,
  },
  sm: {
    minHeight: 30,
    borderRadius: 9,
    paddingHorizontal: 9,
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryStrong,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
  },
  danger: {
    backgroundColor: colors.dangerSoft,
    borderColor: '#FFC3CB',
  },
  label: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontFamily: typography.demi,
    letterSpacing: 0.15,
  },
  label_md: {
    fontSize: 13,
  },
  label_sm: {
    fontSize: 11,
  },
  labelDark: {
    color: colors.text,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.95,
  },
});
