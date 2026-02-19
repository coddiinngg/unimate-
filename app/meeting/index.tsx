import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { RecordingPresets, requestRecordingPermissionsAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import { AppButton } from '../../src/components/ui/AppButton';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppScreen } from '../../src/components/ui/AppScreen';
import { runAiTask } from '../../src/services/ai/aiRouter';
import { useMeetingStore } from '../../src/stores/meetingStore';
import { useTimetableStore } from '../../src/stores/timetableStore';
import { colors } from '../../src/theme/colors';

function mmss(durationMillis: number) {
  const total = Math.max(0, Math.floor(durationMillis / 1000));
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

export default function MeetingScreen() {
  const { classId } = useLocalSearchParams<{ classId?: string }>();
  const linkedClassId = Array.isArray(classId) ? classId[0] : classId;

  const classes = useTimetableStore((state) => state.classes);
  const meetings = useMeetingStore((state) => state.meetings);
  const addMeeting = useMeetingStore((state) => state.addMeeting);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 200);

  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(undefined);
  const [lastRecordingUri, setLastRecordingUri] = useState<string | null>(null);
  const [lastDurationMillis, setLastDurationMillis] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!linkedClassId) return;
    const exists = classes.some((item) => item.id === linkedClassId);
    if (exists) setSelectedClassId(linkedClassId);
  }, [classes, linkedClassId]);

  const selectedClass = useMemo(
    () => classes.find((item) => item.id === selectedClassId),
    [classes, selectedClassId],
  );

  const startRecording = async () => {
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('권한 필요', '녹음을 위해 마이크 권한이 필요합니다.');
        return;
      }
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (error) {
      const message = error instanceof Error ? error.message : '녹음을 시작하지 못했습니다.';
      Alert.alert('녹음 오류', message);
    }
  };

  const stopRecording = async () => {
    try {
      const recordedDuration = recorderState.durationMillis;
      await recorder.stop();
      const uri = recorder.uri ?? recorderState.url;
      if (!uri) {
        Alert.alert('녹음 실패', '녹음 파일 경로를 확인하지 못했습니다.');
        return;
      }
      setLastRecordingUri(uri);
      setLastDurationMillis(recordedDuration);
    } catch (error) {
      const message = error instanceof Error ? error.message : '녹음을 종료하지 못했습니다.';
      Alert.alert('녹음 오류', message);
    }
  };

  const processRecording = async () => {
    if (!lastRecordingUri) {
      Alert.alert('안내', '먼저 녹음을 완료해주세요.');
      return;
    }

    setIsProcessing(true);
    setTranscript('');
    setSummary('');

    try {
      const transcribePrompt = [
        '회의 녹음 전사를 생성해줘.',
        `class: ${selectedClass?.name ?? '미연결'}`,
        `duration: ${mmss(lastDurationMillis)}`,
        `audio_uri: ${lastRecordingUri}`,
      ].join('\n');

      const transcribeResult = await runAiTask('transcribe', transcribePrompt);
      const nextTranscript = transcribeResult.output || '전사 결과가 비어 있습니다.';
      setTranscript(nextTranscript);

      const summaryPrompt = [
        '다음 회의 전사를 바탕으로 한국어 회의록을 만들어줘.',
        '- 결정사항 3개',
        '- 액션아이템 3개',
        '- 다음 회의 전 체크리스트',
        '',
        nextTranscript,
      ].join('\n');

      const summaryResult = await runAiTask('summary', summaryPrompt);
      const nextSummary = summaryResult.output || '결과가 비어 있습니다.';
      setSummary(nextSummary);

      addMeeting({
        classId: selectedClassId,
        title: `${selectedClass?.name ?? '일반'} 회의록`,
        audioUri: lastRecordingUri,
        durationMillis: lastDurationMillis,
        transcript: nextTranscript,
        summary: nextSummary,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '처리 중 오류가 발생했습니다.';
      Alert.alert('처리 오류', message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AppScreen scroll title="Meeting" showBack contentStyle={styles.content}>
      <AppCard>
        <Text style={styles.sectionTitle}>수업</Text>
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
      </AppCard>

      <AppCard>
        <Text style={styles.sectionTitle}>녹음</Text>
        <Text style={styles.meta}>상태: {recorderState.isRecording ? '녹음 중' : '대기'}</Text>
        <Text style={styles.meta}>경과 시간: {mmss(recorderState.durationMillis)}</Text>
        <View style={styles.row}>
          <AppButton label="녹음 시작" onPress={startRecording} disabled={recorderState.isRecording || isProcessing} />
          <AppButton label="녹음 종료" variant="secondary" onPress={stopRecording} disabled={!recorderState.isRecording || isProcessing} />
        </View>
        <AppButton label={isProcessing ? '처리 중' : '전사 + 요약 생성'} onPress={processRecording} disabled={recorderState.isRecording || isProcessing} />
      </AppCard>

      <AppCard>
        <Text style={styles.sectionTitle}>결과</Text>
        <Text style={styles.blockTitle}>전사</Text>
        <Text style={styles.blockText}>{transcript || '없음'}</Text>
        <Text style={styles.blockTitle}>요약</Text>
        <Text style={styles.blockText}>{summary || '없음'}</Text>
      </AppCard>

      <AppCard>
        <Text style={styles.sectionTitle}>기록</Text>
        <View style={styles.logs}>
          {meetings.length === 0 ? <Text style={styles.empty}>없음</Text> : null}
          {meetings.map((item) => {
            const className = item.classId ? classes.find((course) => course.id === item.classId)?.name : undefined;
            return (
              <View key={item.id} style={styles.logItem}>
                <Text style={styles.logTitle}>{item.title}</Text>
                <Text style={styles.logMeta}>{className ?? '미연결'} · {new Date(item.createdAt).toLocaleString()}</Text>
                <Text numberOfLines={2} style={styles.logBody}>{item.summary}</Text>
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
  chips: {
    marginTop: 9,
    gap: 8,
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
  meta: {
    marginTop: 8,
    color: colors.textMuted,
    fontSize: 13,
  },
  row: {
    marginTop: 10,
    marginBottom: 8,
    flexDirection: 'row',
    gap: 8,
  },
  blockTitle: {
    marginTop: 9,
    marginBottom: 4,
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  blockText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  logs: {
    marginTop: 8,
    gap: 8,
  },
  empty: {
    color: colors.textMuted,
    fontSize: 13,
  },
  logItem: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: colors.surface,
  },
  logTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  logMeta: {
    marginTop: 3,
    color: colors.textSubtle,
    fontSize: 11,
    fontWeight: '700',
  },
  logBody: {
    marginTop: 5,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
});
