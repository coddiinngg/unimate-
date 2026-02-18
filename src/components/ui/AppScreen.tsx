import { PropsWithChildren } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface Props extends PropsWithChildren {
  title?: string;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}

export function AppScreen({ title, scroll, children, contentStyle }: Props) {
  const body = (
    <View style={[styles.content, contentStyle]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {children}
    </View>
  );

  return (
    <LinearGradient colors={[colors.background, colors.backgroundAlt]} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        {scroll ? <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>{body}</ScrollView> : body}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  scroll: { paddingBottom: 24 },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
    gap: 14,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    fontFamily: typography.demi,
    letterSpacing: -0.4,
    color: colors.text,
    textAlign: 'center',
    alignSelf: 'center',
    marginBottom: 6,
  },
});
