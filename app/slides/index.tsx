import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AppButton } from '../../src/components/ui/AppButton';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppInput } from '../../src/components/ui/AppInput';
import { AppScreen } from '../../src/components/ui/AppScreen';
import { runAiTask } from '../../src/services/ai/aiRouter';
import { exportDeck } from '../../src/services/slides/exportPptx';
import { useSlidesStore } from '../../src/stores/slidesStore';
import { useTimetableStore } from '../../src/stores/timetableStore';
import { colors } from '../../src/theme/colors';

export default function SlidesScreen() {
  const { classId } = useLocalSearchParams<{ classId?: string }>();
  const linkedClassId = Array.isArray(classId) ? classId[0] : classId;

  const classes = useTimetableStore((state) => state.classes);
  const decks = useSlidesStore((state) => state.decks);
  const activeDeckId = useSlidesStore((state) => state.activeDeckId);
  const createDeck = useSlidesStore((state) => state.createDeck);
  const setActiveDeck = useSlidesStore((state) => state.setActiveDeck);
  const removeDeck = useSlidesStore((state) => state.removeDeck);
  const updateSlide = useSlidesStore((state) => state.updateSlide);

  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(undefined);
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('대학생');
  const [tone, setTone] = useState('설명형');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!linkedClassId) return;
    const exists = classes.some((item) => item.id === linkedClassId);
    if (exists) setSelectedClassId(linkedClassId);
  }, [classes, linkedClassId]);

  const activeDeck = useMemo(
    () => decks.find((deck) => deck.id === activeDeckId) ?? null,
    [activeDeckId, decks],
  );

  const generateDeck = async () => {
    if (!topic.trim()) {
      Alert.alert('입력 필요', '슬라이드 주제를 입력해주세요.');
      return;
    }

    setIsGenerating(true);
    try {
      const className = selectedClassId ? classes.find((item) => item.id === selectedClassId)?.name : undefined;
      const prompt = [
        '발표 슬라이드 목차를 만들어줘.',
        '- 8개 내외 섹션',
        '- 각 줄은 슬라이드 제목만',
        `주제: ${topic.trim()}`,
        `청중: ${audience}`,
        `톤: ${tone}`,
        `수업: ${className ?? '미연결'}`,
      ].join('\n');

      const result = await runAiTask('slides', prompt);
      const rawOutline = result.output || '';
      const id = createDeck({
        classId: selectedClassId,
        title: `${topic.trim()} 발표자료`,
        topic: topic.trim(),
        rawOutline,
      });
      setActiveDeck(id);
    } catch (error) {
      const message = error instanceof Error ? error.message : '슬라이드 생성 중 오류가 발생했습니다.';
      Alert.alert('생성 오류', message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async () => {
    if (!activeDeck) return;

    setIsExporting(true);
    try {
      const result = await exportDeck(activeDeck);
      Alert.alert('내보내기 완료', result.usedFallback ? '텍스트 파일로 내보냈습니다.' : 'PPTX 파일을 생성했습니다.');
    } catch (error) {
      const message = error instanceof Error ? error.message : '내보내기 실패';
      Alert.alert('내보내기 오류', message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AppScreen scroll title="Slides" showBack contentStyle={styles.content}>
      <AppCard>
        <Text style={styles.sectionTitle}>생성 설정</Text>
        <AppInput label="주제" value={topic} onChangeText={setTopic} placeholder="예: 운영체제 스케줄링" />
        <View style={styles.row}>
          <View style={styles.col}><AppInput label="청중" value={audience} onChangeText={setAudience} placeholder="대학생" /></View>
          <View style={styles.col}><AppInput label="톤" value={tone} onChangeText={setTone} placeholder="설명형" /></View>
        </View>

        <Text style={styles.label}>수업 연결</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowScroll}>
          <Text style={[styles.chip, !selectedClassId ? styles.chipActive : null]} onPress={() => setSelectedClassId(undefined)}>연결 안 함</Text>
          {classes.map((item) => (
            <Text key={item.id} style={[styles.chip, selectedClassId === item.id ? styles.chipActive : null]} onPress={() => setSelectedClassId(item.id)}>
              {item.name}
            </Text>
          ))}
        </ScrollView>
        <AppButton label={isGenerating ? '생성 중' : '슬라이드 구조 생성'} onPress={generateDeck} disabled={isGenerating} />
      </AppCard>

      <AppCard>
        <Text style={styles.sectionTitle}>덱 목록</Text>
        <View style={styles.deckList}>
          {decks.length === 0 ? <Text style={styles.empty}>생성된 슬라이드 덱이 없습니다.</Text> : null}
          {decks.map((deck) => (
            <Text key={deck.id} style={[styles.deckPill, activeDeckId === deck.id ? styles.deckPillActive : null]} onPress={() => setActiveDeck(deck.id)}>
              {deck.title}
            </Text>
          ))}
        </View>
      </AppCard>

      {activeDeck ? (
        <AppCard>
          <Text style={styles.sectionTitle}>슬라이드 편집</Text>
          <Text style={styles.meta}>주제: {activeDeck.topic}</Text>
          <View style={styles.slideList}>
            {activeDeck.slides.map((slide) => (
              <View key={slide.id} style={styles.slideItem}>
                <Text style={styles.slideNumber}>Slide {slide.order}</Text>
                <TextInput
                  value={slide.title}
                  onChangeText={(value) => updateSlide(activeDeck.id, slide.id, { title: value })}
                  style={styles.slideTitleInput}
                  placeholder="슬라이드 제목"
                  placeholderTextColor={colors.textSubtle}
                />
                <TextInput
                  value={slide.bullets.join('\n')}
                  onChangeText={(value) =>
                    updateSlide(activeDeck.id, slide.id, {
                      bullets: value
                        .split('\n')
                        .map((line) => line.trim())
                        .filter(Boolean),
                    })
                  }
                  style={styles.slideBulletInput}
                  multiline
                  placeholder="불릿을 줄바꿈으로 입력"
                  placeholderTextColor={colors.textSubtle}
                />
              </View>
            ))}
          </View>

          <View style={styles.rowButtons}>
            <AppButton label={isExporting ? '내보내는 중' : 'PPT 내보내기'} onPress={handleExport} disabled={isExporting} />
            <AppButton label="덱 삭제" variant="danger" onPress={() => removeDeck(activeDeck.id)} />
          </View>
        </AppCard>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 6 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  label: { marginTop: 8, marginBottom: 6, color: colors.textSubtle, fontSize: 12, fontWeight: '700' },
  row: { flexDirection: 'row', gap: 8 },
  col: { flex: 1 },
  rowScroll: { gap: 8, marginBottom: 10, marginTop: 4 },
  chip: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1,
    borderColor: colors.borderStrong, color: colors.textMuted, fontSize: 12, fontWeight: '700', backgroundColor: colors.surface,
  },
  chipActive: { borderColor: colors.primaryStrong, color: colors.primaryStrong, backgroundColor: colors.primarySoft },
  deckList: { marginTop: 8, gap: 8 },
  deckPill: {
    borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8,
    color: colors.textMuted, backgroundColor: colors.surface, fontWeight: '700',
  },
  deckPillActive: { borderColor: colors.primaryStrong, color: colors.primaryStrong, backgroundColor: colors.primarySoft },
  empty: { color: colors.textMuted, fontSize: 13 },
  meta: { marginTop: 6, color: colors.textMuted, fontSize: 13 },
  slideList: { marginTop: 10, gap: 10 },
  slideItem: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 10, backgroundColor: colors.surface,
  },
  slideNumber: { color: colors.textSubtle, fontSize: 11, fontWeight: '700', marginBottom: 6 },
  slideTitleInput: {
    borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8,
    color: colors.text, fontSize: 14, backgroundColor: '#FFFFFF',
  },
  slideBulletInput: {
    marginTop: 8, minHeight: 78, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 8, color: colors.text, backgroundColor: '#FFFFFF', textAlignVertical: 'top', fontSize: 13,
  },
  rowButtons: { marginTop: 10, flexDirection: 'row', gap: 8 },
});
