import { PropsWithChildren } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface Props extends PropsWithChildren {
  title?: string;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  showBack?: boolean;
}

export function AppScreen({ title, scroll, children, contentStyle, showBack = false }: Props) {
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)');
  };

  const body = (
    <View style={[styles.content, contentStyle]}>
      {showBack ? (
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backText}>{'<'}</Text>
          </Pressable>
          {title ? <Text style={styles.title}>{title}</Text> : <View style={styles.titleSpacer} />}
          <View style={styles.titleSpacer} />
        </View>
      ) : title ? (
        <Text style={styles.titlePlain}>{title}</Text>
      ) : null}
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
    paddingTop: 6,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: -1,
  },
  titleSpacer: {
    width: 34,
    height: 34,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: typography.demi,
    letterSpacing: -0.2,
    color: colors.text,
    textAlign: 'center',
  },
  titlePlain: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: typography.demi,
    letterSpacing: -0.2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 2,
  },
});
