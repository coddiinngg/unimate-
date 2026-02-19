import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AppButton } from '../../src/components/ui/AppButton';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppInput } from '../../src/components/ui/AppInput';
import { AppScreen } from '../../src/components/ui/AppScreen';
import { runAiTask } from '../../src/services/ai/aiRouter';
import { useDocumentStore } from '../../src/stores/documentStore';
import { useTimetableStore } from '../../src/stores/timetableStore';
import { colors } from '../../src/theme/colors';

export default function DocumentsScreen() {
  const { classId } = useLocalSearchParams<{ classId?: string }>();
  const linkedClassId = Array.isArray(classId) ? classId[0] : classId;

  const classes = useTimetableStore((state) => state.classes);
  const documents = useDocumentStore((state) => state.documents);
  const activeDocumentId = useDocumentStore((state) => state.activeDocumentId);
  const createDocument = useDocumentStore((state) => state.createDocument);
  const deleteDocument = useDocumentStore((state) => state.deleteDocument);
  const setActiveDocument = useDocumentStore((state) => state.setActiveDocument);
  const updateDocument = useDocumentStore((state) => state.updateDocument);

  const activeDocument = useMemo(
    () => documents.find((item) => item.id === activeDocumentId) ?? null,
    [activeDocumentId, documents],
  );

  const [draftClassId, setDraftClassId] = useState<string | undefined>(undefined);
  const [loadingAction, setLoadingAction] = useState<null | 'write' | 'summary' | 'expand'>(null);

  useEffect(() => {
    if (!linkedClassId) return;
    const exists = classes.some((item) => item.id === linkedClassId);
    if (exists) setDraftClassId(linkedClassId);
  }, [classes, linkedClassId]);

  const handleCreate = () => {
    const createdId = createDocument({ classId: draftClassId, title: draftClassId ? '수업 문서' : '새 문서' });
    setActiveDocument(createdId);
  };

  const handleDelete = () => {
    if (!activeDocumentId) return;
    deleteDocument(activeDocumentId);
  };

  const runAssist = async (mode: 'write' | 'summary' | 'expand') => {
    if (!activeDocument) {
      Alert.alert('안내', '먼저 문서를 선택해주세요.');
      return;
    }

    const content = activeDocument.content.trim();
    if (!content && mode !== 'write') {
      Alert.alert('안내', '요약/확장을 위해 본문을 입력해주세요.');
      return;
    }

    setLoadingAction(mode);
    try {
      const className = activeDocument.classId ? classes.find((item) => item.id === activeDocument.classId)?.name : undefined;
      const promptBase = `수업: ${className ?? '미연결'}\n제목: ${activeDocument.title}`;

      if (mode === 'write') {
        const prompt = [
          '아래 문서 제목에 맞춰 학습 문서 초안을 작성해줘.',
          '- 마크다운 형식',
          '- 핵심 개념 3개',
          '- 예시 2개',
          promptBase,
        ].join('\n');
        const result = await runAiTask('document', prompt);
        updateDocument(activeDocument.id, { content: result.output || activeDocument.content });
      }

      if (mode === 'summary') {
        const prompt = [
          '다음 문서를 핵심만 요약해줘.',
          '- 5줄 이내',
          '- 시험 직전 복습용',
          promptBase,
          '',
          content,
        ].join('\n');
        const result = await runAiTask('summary', prompt);
        updateDocument(activeDocument.id, { content: `${content}\n\n---\n\n## AI 요약\n${result.output || ''}` });
      }

      if (mode === 'expand') {
        const prompt = [
          '다음 문서를 더 자세히 확장해줘.',
          '- 설명을 보강',
          '- 누락된 배경 개념 추가',
          promptBase,
          '',
          content,
        ].join('\n');
        const result = await runAiTask('document', prompt);
        updateDocument(activeDocument.id, { content: result.output || content });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AI 처리 중 오류가 발생했습니다.';
      Alert.alert('AI 오류', message);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <AppScreen scroll title="Documents" showBack contentStyle={styles.content}>
      <AppCard>
        <Text style={styles.sectionTitle}>문서 목록</Text>
        <Text style={styles.label}>기본 수업</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowScroll}>
          <Text style={[styles.chip, !draftClassId ? styles.chipActive : null]} onPress={() => setDraftClassId(undefined)}>연결 안 함</Text>
          {classes.map((item) => (
            <Text key={item.id} style={[styles.chip, draftClassId === item.id ? styles.chipActive : null]} onPress={() => setDraftClassId(item.id)}>
              {item.name}
            </Text>
          ))}
        </ScrollView>

        <View style={styles.rowButtons}>
          <AppButton label="새 문서" size="sm" onPress={handleCreate} />
          <AppButton label="삭제" size="sm" variant="danger" onPress={handleDelete} />
        </View>

        <View style={styles.listWrap}>
          {documents.map((item) => (
            <Text
              key={item.id}
              style={[styles.docItem, item.id === activeDocumentId ? styles.docItemActive : null]}
              onPress={() => setActiveDocument(item.id)}
            >
              {item.title}
            </Text>
          ))}
        </View>
      </AppCard>

      {activeDocument ? (
        <AppCard>
          <Text style={styles.sectionTitle}>에디터</Text>
          <AppInput
            label="제목"
            value={activeDocument.title}
            onChangeText={(value) => updateDocument(activeDocument.id, { title: value })}
            placeholder="문서 제목"
          />

          <Text style={styles.label}>본문</Text>
          <TextInput
            value={activeDocument.content}
            onChangeText={(value) => updateDocument(activeDocument.id, { content: value })}
            style={styles.editor}
            multiline
            placeholder="문서 내용을 입력하세요"
            placeholderTextColor={colors.textSubtle}
          />

          <View style={styles.rowButtons}>
            <AppButton label={loadingAction === 'write' ? '작성 중' : '작성해줘'} size="sm" onPress={() => runAssist('write')} disabled={!!loadingAction} />
            <AppButton label={loadingAction === 'summary' ? '요약 중' : '요약해줘'} size="sm" variant="secondary" onPress={() => runAssist('summary')} disabled={!!loadingAction} />
            <AppButton label={loadingAction === 'expand' ? '확장 중' : '확장해줘'} size="sm" variant="secondary" onPress={() => runAssist('expand')} disabled={!!loadingAction} />
          </View>
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
  rowButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  listWrap: {
    gap: 8,
  },
  docItem: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  docItemActive: {
    borderColor: colors.primaryStrong,
    color: colors.primaryStrong,
    backgroundColor: colors.primarySoft,
  },
  editor: {
    minHeight: 280,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
    fontSize: 14,
    lineHeight: 21,
  },
});
