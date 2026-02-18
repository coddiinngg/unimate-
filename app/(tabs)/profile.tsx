import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppButton } from '../../src/components/ui/AppButton';
import { colors } from '../../src/theme/colors';
import { useAuthStore } from '../../src/stores/authStore';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>프로필</Text>
        <AppCard>
          <Text style={styles.name}>{user?.name ?? '이름 없음'}</Text>
          <Text style={styles.row}>이메일: {user?.email ?? '-'}</Text>
          <Text style={styles.row}>대학교: {user?.university ?? '-'}</Text>
          <Text style={styles.row}>학과: {user?.major ?? '-'}</Text>
          <Text style={styles.row}>학년: {user?.grade ?? '-'}</Text>
        </AppCard>
        <AppButton label="로그아웃" variant="danger" onPress={logout} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  name: { fontSize: 18, fontWeight: '800', color: colors.text },
  row: { marginTop: 4, color: colors.textMuted },
});
