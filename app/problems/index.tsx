import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AppButton } from '../../src/components/ui/AppButton';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppInput } from '../../src/components/ui/AppInput';
import { AppScreen } from '../../src/components/ui/AppScreen';
import { runAiTask } from '../../src/services/ai/aiRouter';
import { useProblemStore } from '../../src/stores/problemStore';
import { useTimetableStore } from '../../src/stores/timetableStore';
import { colors } from '../../src/theme/colors';

export default function ProblemsScreen() {
  const { classId } = useLocalSearchParams<{ classId?: string }>();
  const linkedClassId = Array.isArray(classId) ? classId[0] : classId;

  const classes = useTimetableStore((state) => state.classes);
  const sets = useProblemStore((state) => state.sets);
  const attempts = useProblemStore((state) => state.attempts);
  const createSet = useProblemStore((state) => state.createSet);
  const submitAttempt = useProblemStore((state) => state.submitAttempt);

  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(undefined);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('중간');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    if (!linkedClassId) return;
    const exists = classes.some((item) => item.id === linkedClassId);
    if (exists) setSelectedClassId(linkedClassId);
  }, [classes, linkedClassId]);

  const activeSet = useMemo(
    () => sets.find((item) => item.id === selectedSetId) ?? null,
    [selectedSetId, sets],
  );

  const generateProblems = async () => {
    if (!topic.trim()) {
      Alert.alert('입력 필요', '문제 주제를 입력해주세요.');
      return;
    }

    setIsGenerating(true);
    try {
      const className = selectedClassId ? classes.find((item) => item.id === selectedClassId)?.name : undefined;
      const prompt = [
        '학습용 문제 5개를 만들어줘.',
        '- 한국어',
        '- 단답/서술 혼합',
        `난이도: ${difficulty}`,
        `수업: ${className ?? '미연결'}`,
        `주제: ${topic.trim()}`,
      ].join('\n');

      const result = await runAiTask('problems', prompt);
      const raw = result.output || '';

      const setId = createSet({
        classId: selectedClassId,
        title: `${topic.trim()} 문제세트`,
        topic: topic.trim(),
        generatedRaw: raw,
      });
      setSelectedSetId(setId);
      setAnswers({});
    } catch (error) {
      const message = error instanceof Error ? error.message : '문제 생성 중 오류가 발생했습니다.';
      Alert.alert('생성 오류', message);
    } finally {
      setIsGenerating(false);
    }
  };

  const gradeAnswers = async () => {
    if (!activeSet) return;

    const answeredCount = activeSet.problems.filter((problem) => (answers[problem.id] || '').trim().length > 0).length;
    if (answeredCount === 0) {
      Alert.alert('안내', '최소 한 문제 이상 답안을 입력해주세요.');
      return;
    }

    setGrading(true);
    try {
      const score = Math.round((answeredCount / activeSet.problems.length) * 100);
      const payload = activeSet.problems
        .map((problem, index) => `${index + 1}. Q: ${problem.prompt}\nA: ${(answers[problem.id] || '').trim() || '(미응답)'}`)
        .join('\n\n');

      const feedbackPrompt = [
        '다음 답안을 채점하고 피드백을 작성해줘.',
        '- 총평 3줄',
        '- 개선 포인트 3개',
        '- 다음 학습 추천',
        '',
        payload,
      ].join('\n');

      const feedbackResult = await runAiTask('summary', feedbackPrompt);
      const feedback = feedbackResult.output || '피드백 결과가 비어 있습니다.';

      submitAttempt({
        setId: activeSet.id,
        answers,
        score,
        feedback,
      });

      Alert.alert('채점 완료', `점수: ${score}점`);
    } catch (error) {
      const message = error instanceof Error ? error.message : '채점 중 오류가 발생했습니다.';
      Alert.alert('채점 오류', message);
    } finally {
      setGrading(false);
    }
  };

  const lastAttempt = activeSet ? attempts.find((item) => item.setId === activeSet.id) : undefined;

  return (
    <AppScreen scroll title="Problems" showBack contentStyle={styles.content}>
      <AppCard>
        <Text style={styles.sectionTitle}>문제 생성</Text>
        <AppInput label="주제" value={topic} onChangeText={setTopic} placeholder="예: 운영체제 스케줄링" />
        <Text style={styles.label}>난이도</Text>
        <View style={styles.row}>
          {['쉬움', '중간', '어려움'].map((level) => (
            <Text
              key={level}
              style={[styles.chip, difficulty === level ? styles.chipActive : null]}
              onPress={() => setDifficulty(level)}
            >
              {level}
            </Text>
          ))}
        </View>
        <Text style={styles.label}>수업</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowScroll}>
          <Text style={[styles.chip, !selectedClassId ? styles.chipActive : null]} onPress={() => setSelectedClassId(undefined)}>연결 안 함</Text>
          {classes.map((item) => (
            <Text key={item.id} style={[styles.chip, selectedClassId === item.id ? styles.chipActive : null]} onPress={() => setSelectedClassId(item.id)}>
              {item.name}
            </Text>
          ))}
        </ScrollView>
        <AppButton label={isGenerating ? '생성 중' : '문제 생성'} onPress={generateProblems} disabled={isGenerating} />
      </AppCard>

      <AppCard>
        <Text style={styles.sectionTitle}>세트 목록</Text>
        <View style={styles.setList}>
          {sets.length === 0 ? <Text style={styles.empty}>없음</Text> : null}
          {sets.map((setItem) => (
            <Text
              key={setItem.id}
              style={[styles.setPill, selectedSetId === setItem.id ? styles.setPillActive : null]}
              onPress={() => {
                setSelectedSetId(setItem.id);
                setAnswers({});
              }}
            >
              {setItem.title}
            </Text>
          ))}
        </View>
      </AppCard>

      {activeSet ? (
        <AppCard>
          <Text style={styles.sectionTitle}>풀이</Text>
          <Text style={styles.meta}>주제: {activeSet.topic}</Text>
          <View style={styles.problemsWrap}>
            {activeSet.problems.map((problem) => (
              <View key={problem.id} style={styles.problemItem}>
                <Text style={styles.problemTitle}>{problem.order}. {problem.prompt}</Text>
                <TextInput
                  value={answers[problem.id] ?? ''}
                  onChangeText={(value) => setAnswers((prev) => ({ ...prev, [problem.id]: value }))}
                  placeholder="답안을 입력하세요"
                  placeholderTextColor={colors.textSubtle}
                  style={styles.answerInput}
                  multiline
                />
              </View>
            ))}
          </View>
          <AppButton label={grading ? '채점 중' : '채점하기'} onPress={gradeAnswers} disabled={grading} />

          {lastAttempt ? (
            <View style={styles.feedbackWrap}>
              <Text style={styles.feedbackTitle}>최근 채점 결과: {lastAttempt.score}점</Text>
              <Text style={styles.feedbackBody}>{lastAttempt.feedback}</Text>
            </View>
          ) : null}
        </AppCard>
      ) : null}
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
    marginTop: 8,
    marginBottom: 6,
    color: colors.textSubtle,
    fontSize: 12,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  rowScroll: {
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
  setList: {
    marginTop: 8,
    gap: 8,
  },
  empty: {
    color: colors.textMuted,
    fontSize: 13,
  },
  setPill: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  setPillActive: {
    borderColor: colors.primaryStrong,
    color: colors.primaryStrong,
    backgroundColor: colors.primarySoft,
  },
  meta: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 13,
  },
  problemsWrap: {
    marginTop: 10,
    gap: 10,
  },
  problemItem: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 10,
    backgroundColor: colors.surface,
  },
  problemTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  answerInput: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 10,
    minHeight: 72,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: colors.text,
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
    fontSize: 13,
  },
  feedbackWrap: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  feedbackTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  feedbackBody: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
});
