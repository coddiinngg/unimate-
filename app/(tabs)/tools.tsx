import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppButton } from '../../src/components/ui/AppButton';
import { colors } from '../../src/theme/colors';

const tools = [
  { label: 'AI 채팅', path: '/chat' },
  { label: 'AI 슬라이드', path: '/slides' },
  { label: 'AI 문서', path: '/documents' },
  { label: 'AI 디자이너', path: '/designer' },
  { label: 'AI 스케줄러', path: '/scheduler' },
  { label: 'AI 영상 요약', path: '/video-summary' },
  { label: 'AI 문제', path: '/problems' },
  { label: 'AI 회의', path: '/meeting' },
];

export default function ToolsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>AI 도구</Text>
        <Text style={styles.subtitle}>9개 도구를 수업 문맥과 연결해 사용합니다.</Text>
        <View style={styles.grid}>
          {tools.map((tool) => (
            <AppButton
              key={tool.path}
              label={tool.label}
              variant="secondary"
              style={styles.item}
              onPress={() => router.push(tool.path as any)}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { color: colors.textMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  item: { width: '48%' },
});
