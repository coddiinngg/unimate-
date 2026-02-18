import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface Props extends TextInputProps {
  label: string;
  error?: string;
}

export function AppInput({ label, error, ...props }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor={colors.textSubtle}
        style={[styles.input, error ? styles.error : null]}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 7 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: typography.medium,
    color: colors.text,
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 13,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surface,
    fontFamily: typography.regular,
  },
  error: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: typography.medium,
  },
});
