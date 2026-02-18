import { StyleSheet, Text, View } from 'react-native';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppButton } from '../../src/components/ui/AppButton';
import { AppScreen } from '../../src/components/ui/AppScreen';
import { colors } from '../../src/theme/colors';
import { useAuthStore } from '../../src/stores/authStore';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <AppScreen title="Profile">
      <AppCard>
        <Text style={styles.name}>{user?.name ?? '이름 없음'}</Text>
        <View style={styles.infoWrap}>
          <Text style={styles.row}>이메일: {user?.email ?? '-'}</Text>
          <Text style={styles.row}>대학교: {user?.university ?? '-'}</Text>
          <Text style={styles.row}>학과: {user?.major ?? '-'}</Text>
          <Text style={styles.row}>학년: {user?.grade ?? '-'}</Text>
        </View>
      </AppCard>
      <AppButton label="로그아웃" variant="danger" onPress={logout} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  name: {
    fontSize: 21,
    fontWeight: '900',
    color: colors.text,
  },
  infoWrap: {
    marginTop: 10,
    gap: 3,
  },
  row: {
    color: colors.textMuted,
    lineHeight: 21,
  },
});
