import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AppButton } from '../../src/components/ui/AppButton';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppInput } from '../../src/components/ui/AppInput';
import { AppScreen } from '../../src/components/ui/AppScreen';
import { runAiTask } from '../../src/services/ai/aiRouter';
import { extractCaptionsFromYouTubeUrl } from '../../src/services/ai/youtube';
import { useTimetableStore } from '../../src/stores/timetableStore';
import { useVideoSummaryStore } from '../../src/stores/videoSummaryStore';
import { colors } from '../../src/theme/colors';

function buildKeyPoints(summary: string) {
  const lines = summary
    .split(/\n|\.|!/)
    .map((line) => line.replace(/^[-*\s]+/, '').trim())
    .filter(Boolean);
  return lines.slice(0, 5);
}

export default function VideoSummaryScreen() {
  const { classId } = useLocalSearchParams<{ classId?: string }>();
  const linkedClassId = Array.isArray(classId) ? classId[0] : classId;

  const classes = useTimetableStore((state) => state.classes);
  const summaries = useVideoSummaryStore((state) => state.summaries);
  const addSummary = useVideoSummaryStore((state) => state.addSummary);

  const [url, setUrl] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(undefined);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!linkedClassId) return;
    const exists = classes.some((item) => item.id === linkedClassId);
    if (exists) setSelectedClassId(linkedClassId);
  }, [classes, linkedClassId]);

  const selectedClassName = useMemo(
    () => classes.find((item) => item.id === selectedClassId)?.name,
    [classes, selectedClassId],
  );

  const processUrl = async () => {
    if (!url.trim()) {
      Alert.alert('입력 필요', 'YouTube URL을 입력해주세요.');
      return;
    }

    setIsProcessing(true);
    setTranscript('');
    setSummary('');
    setKeyPoints([]);

    try {
      const extracted = await extractCaptionsFromYouTubeUrl(url);
      setTranscript(extracted.transcript);

      const summaryPrompt = [
        '다음 강의 자막을 학습용 요약으로 정리해줘.',
        '- 핵심 개념',
        '- 시험 대비 포인트',
        '- 다시 볼 타임스탬프',
        `수업명: ${selectedClassName ?? '미지정'}`,
        '',
        extracted.transcript,
      ].join('\n');

      const summaryResult = await runAiTask('summary', summaryPrompt);
      const nextSummary = summaryResult.output || '결과가 비어 있습니다.';
      const nextKeyPoints = buildKeyPoints(nextSummary);

      setSummary(nextSummary);
      setKeyPoints(nextKeyPoints);

      addSummary({
        classId: selectedClassId,
        sourceUrl: url.trim(),
        videoId: extracted.videoId,
        transcript: extracted.transcript,
        summary: nextSummary,
        keyPoints: nextKeyPoints,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '처리 중 오류가 발생했습니다.';
      Alert.alert('요약 오류', message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AppScreen scroll title="Video" showBack contentStyle={styles.content}>
      <AppCard>
        <Text style={styles.sectionTitle}>입력</Text>
        <AppInput
          label="YouTube URL"
          value={url}
          onChangeText={setUrl}
          placeholder="https://www.youtube.com/watch?v=..."
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.label}>수업</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Text
            style={[styles.chip, !selectedClassId ? styles.chipActive : null]}
            onPress={() => setSelectedClassId(undefined)}
          >
            연결 안 함
          </Text>
          {classes.map((item) => (
            <Text
              key={item.id}
              style={[styles.chip, selectedClassId === item.id ? styles.chipActive : null]}
              onPress={() => setSelectedClassId(item.id)}
            >
              {item.name}
            </Text>
          ))}
        </ScrollView>
        <AppButton label={isProcessing ? '처리 중' : '자막 추출 + 요약'} onPress={processUrl} disabled={isProcessing} />
      </AppCard>

      <AppCard>
        <Text style={styles.sectionTitle}>결과</Text>
        <Text style={styles.subTitle}>핵심 포인트</Text>
        <View style={styles.points}>
          {keyPoints.length === 0 ? <Text style={styles.empty}>없음</Text> : null}
          {keyPoints.map((point, index) => (
            <Text key={`${point}-${index}`} style={styles.point}>• {point}</Text>
          ))}
        </View>
        <Text style={styles.subTitle}>요약 본문</Text>
        <Text style={styles.body}>{summary || '없음'}</Text>
        <Text style={styles.subTitle}>자막 원문</Text>
        <Text style={styles.body}>{transcript || '없음'}</Text>
      </AppCard>

      <AppCard>
        <Text style={styles.sectionTitle}>기록</Text>
        <View style={styles.savedWrap}>
          {summaries.length === 0 ? <Text style={styles.empty}>없음</Text> : null}
          {summaries.map((item) => {
            const className = item.classId ? classes.find((course) => course.id === item.classId)?.name : undefined;
            return (
              <View key={item.id} style={styles.savedItem}>
                <Text style={styles.savedTitle}>{className ?? '미연결'} · {item.videoId}</Text>
                <Text style={styles.savedMeta}>{new Date(item.createdAt).toLocaleString()}</Text>
                <Text numberOfLines={2} style={styles.savedBody}>{item.summary}</Text>
              </View>
            );
          })}
        </View>
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  label: {
    marginTop: 10,
    marginBottom: 6,
    color: colors.textSubtle,
    fontWeight: '700',
    fontSize: 12,
  },
  chips: {
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: colors.surface,
  },
  chipActive: {
    borderColor: colors.primaryStrong,
    color: colors.primaryStrong,
    backgroundColor: colors.primarySoft,
  },
  subTitle: {
    marginTop: 10,
    marginBottom: 4,
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  points: {
    gap: 4,
  },
  point: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  body: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  savedWrap: {
    marginTop: 8,
    gap: 8,
  },
  savedItem: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: colors.surface,
  },
  savedTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  savedMeta: {
    marginTop: 3,
    color: colors.textSubtle,
    fontSize: 11,
    fontWeight: '700',
  },
  savedBody: {
    marginTop: 5,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  empty: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
