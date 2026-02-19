import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AppButton } from '../../src/components/ui/AppButton';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppInput } from '../../src/components/ui/AppInput';
import { AppScreen } from '../../src/components/ui/AppScreen';
import { runAiTask } from '../../src/services/ai/aiRouter';
import { useDesignerStore } from '../../src/stores/designerStore';
import { useTimetableStore } from '../../src/stores/timetableStore';
import { colors } from '../../src/theme/colors';

function seedImageUrl(seed: string) {
  const encoded = encodeURIComponent(seed.slice(0, 48) || 'design');
  return `https://picsum.photos/seed/${encoded}/1200/800`;
}

export default function DesignerScreen() {
  const { classId } = useLocalSearchParams<{ classId?: string }>();
  const linkedClassId = Array.isArray(classId) ? classId[0] : classId;

  const classes = useTimetableStore((state) => state.classes);
  const designs = useDesignerStore((state) => state.designs);
  const addDesign = useDesignerStore((state) => state.addDesign);
  const removeDesign = useDesignerStore((state) => state.removeDesign);

  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState('스터디 모집 포스터');
  const [style, setStyle] = useState('플랫 일러스트');
  const [prompt, setPrompt] = useState('캠퍼스 분위기, 명확한 타이포그래피, 높은 대비');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!linkedClassId) return;
    const exists = classes.some((item) => item.id === linkedClassId);
    if (exists) setSelectedClassId(linkedClassId);
  }, [classes, linkedClassId]);

  const generateDesign = async () => {
    if (!title.trim() || !prompt.trim()) {
      Alert.alert('입력 필요', '제목과 프롬프트를 입력해주세요.');
      return;
    }

    setIsGenerating(true);
    try {
      const className = selectedClassId ? classes.find((item) => item.id === selectedClassId)?.name : undefined;
      const aiPrompt = [
        '포스터 디자인 컨셉을 생성해줘.',
        `제목: ${title.trim()}`,
        `스타일: ${style.trim() || '기본'}`,
        `수업: ${className ?? '미연결'}`,
        `요구사항: ${prompt.trim()}`,
        '- 색상 팔레트 3개',
        '- 타이포그래피 방향',
        '- 레이아웃 구성',
      ].join('\n');

      const result = await runAiTask('image', aiPrompt);
      const notes = result.output || '생성 결과가 비어 있습니다.';

      addDesign({
        classId: selectedClassId,
        title: title.trim(),
        style: style.trim() || '기본',
        prompt: prompt.trim(),
        imageUrl: seedImageUrl(`${title.trim()}-${prompt.trim()}`),
        notes,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '디자인 생성 중 오류가 발생했습니다.';
      Alert.alert('생성 오류', message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppScreen scroll title="Designer" showBack contentStyle={styles.content}>
      <AppCard>
        <Text style={styles.sectionTitle}>시안 생성</Text>
        <AppInput label="작업 제목" value={title} onChangeText={setTitle} placeholder="예: 알고리즘 세미나 포스터" />
        <AppInput label="스타일" value={style} onChangeText={setStyle} placeholder="예: 모던 미니멀" />
        <AppInput label="프롬프트" value={prompt} onChangeText={setPrompt} placeholder="색감/분위기/구성" multiline />

        <Text style={styles.label}>수업 연결</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowScroll}>
          <Text style={[styles.chip, !selectedClassId ? styles.chipActive : null]} onPress={() => setSelectedClassId(undefined)}>연결 안 함</Text>
          {classes.map((item) => (
            <Text key={item.id} style={[styles.chip, selectedClassId === item.id ? styles.chipActive : null]} onPress={() => setSelectedClassId(item.id)}>
              {item.name}
            </Text>
          ))}
        </ScrollView>

        <AppButton label={isGenerating ? '생성 중' : '디자인 시안 생성'} onPress={generateDesign} disabled={isGenerating} />
      </AppCard>

      <AppCard>
        <Text style={styles.sectionTitle}>생성된 시안</Text>
        <View style={styles.grid}>
          {designs.length === 0 ? <Text style={styles.empty}>생성된 시안이 없습니다.</Text> : null}
          {designs.map((item) => (
            <View key={item.id} style={styles.designCard}>
              {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.preview} resizeMode="cover" /> : null}
              <Text style={styles.designTitle}>{item.title}</Text>
              <Text style={styles.designMeta}>{item.style} · {new Date(item.createdAt).toLocaleString()}</Text>
              <Text style={styles.designPrompt}>프롬프트: {item.prompt}</Text>
              <Text style={styles.designNotes}>{item.notes}</Text>
              <AppButton label="삭제" variant="danger" size="sm" onPress={() => removeDesign(item.id)} />
            </View>
          ))}
        </View>
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 6 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  label: { marginTop: 8, marginBottom: 6, color: colors.textSubtle, fontSize: 12, fontWeight: '700' },
  rowScroll: { gap: 8, marginBottom: 10 },
  chip: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1,
    borderColor: colors.borderStrong, color: colors.textMuted, fontSize: 12, fontWeight: '700', backgroundColor: colors.surface,
  },
  chipActive: { borderColor: colors.primaryStrong, color: colors.primaryStrong, backgroundColor: colors.primarySoft },
  grid: { marginTop: 8, gap: 10 },
  empty: { color: colors.textMuted, fontSize: 13 },
  designCard: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 10, backgroundColor: colors.surface,
  },
  preview: { width: '100%', height: 160, borderRadius: 10, marginBottom: 8, backgroundColor: '#E9EDF5' },
  designTitle: { color: colors.text, fontSize: 14, fontWeight: '800' },
  designMeta: { marginTop: 3, color: colors.textSubtle, fontSize: 11, fontWeight: '700' },
  designPrompt: { marginTop: 6, color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  designNotes: { marginTop: 6, marginBottom: 8, color: colors.textMuted, fontSize: 12, lineHeight: 18 },
});
