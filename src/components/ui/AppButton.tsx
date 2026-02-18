import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
}

export function AppButton({ label, onPress, disabled, variant = 'primary', style }: Props) {
  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], disabled ? styles.disabled : null, style]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.label, variant !== 'primary' ? styles.labelDark : null]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.primarySoft,
  },
  danger: {
    backgroundColor: '#FEE2E2',
  },
  label: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  labelDark: {
    color: colors.text,
  },
  disabled: {
    opacity: 0.6,
  },
});
