import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppScreen } from '../../src/components/ui/AppScreen';
import { Reveal } from '../../src/components/ui/Reveal';
import { ToolFeatureCard } from '../../src/components/ui/ToolFeatureCard';
import { colors } from '../../src/theme/colors';

type ToolItem = {
  label: string;
  path: string;
  subtitle: string;
  badge: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: string;
};

const tools: ToolItem[] = [
  { label: 'AI 채팅', path: '/chat', subtitle: '질문하기', badge: 'Phase 2', icon: 'chatbubble-ellipses-outline', tone: '#FDF3E5' },
  { label: 'AI 슬라이드', path: '/slides', subtitle: 'PPT 생성', badge: 'Phase 7', icon: 'easel-outline', tone: '#EAF6E9' },
  { label: 'AI 문서', path: '/documents', subtitle: '문서 작성', badge: 'Phase 6', icon: 'document-text-outline', tone: '#E9F2FF' },
  { label: 'AI 디자이너', path: '/designer', subtitle: '시안 생성', badge: 'Phase 8', icon: 'color-wand-outline', tone: '#F7ECFF' },
  { label: 'AI 스케줄러', path: '/scheduler', subtitle: '일정 추천', badge: 'Phase 9', icon: 'calendar-number-outline', tone: '#F2F5FF' },
  { label: 'AI 영상 요약', path: '/video-summary', subtitle: '영상 요약', badge: 'Phase 4', icon: 'videocam-outline', tone: '#E8F8FA' },
  { label: 'AI 문제', path: '/problems', subtitle: '문제 생성', badge: 'Phase 5', icon: 'help-circle-outline', tone: '#FFF2E8' },
  { label: 'AI 회의', path: '/meeting', subtitle: '회의 정리', badge: 'Phase 3', icon: 'people-outline', tone: '#EEF7EE' },
];

export default function ToolsScreen() {
  return (
    <AppScreen title="Tools" contentStyle={styles.screenContent}>
      <View style={styles.grid}>
        {tools.map((tool, index) => (
          <Reveal key={tool.path} delay={40 + index * 35} style={styles.cardSlot}>
            <ToolFeatureCard
              title={tool.label}
              subtitle={tool.subtitle}
              badge={tool.badge}
              icon={tool.icon}
              tone={tool.tone}
              onPress={() => router.push(tool.path as never)}
            />
          </Reveal>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingTop: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  cardSlot: {
    width: '48.5%',
  },
});
