import { PropsWithChildren } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, shadow } from '../../theme/colors';

export function AppCard({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    ...shadow.card,
  },
});
