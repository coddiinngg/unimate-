import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams } from 'expo-router';
import { AppButton } from '../../src/components/ui/AppButton';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppScreen } from '../../src/components/ui/AppScreen';
import { runAiTask } from '../../src/services/ai/aiRouter';
import { useDriveStore } from '../../src/stores/driveStore';
import { useTimetableStore } from '../../src/stores/timetableStore';
import { colors } from '../../src/theme/colors';

function parseTags(text: string) {
  return text
    .split(/\n|,|\.|·|\||;/)
    .map((item) => item.replace(/^[-*\s#]+/, '').trim())
    .filter(Boolean)
    .slice(0, 6);
}

export default function DriveScreen() {
  const { classId } = useLocalSearchParams<{ classId?: string }>();
  const linkedClassId = Array.isArray(classId) ? classId[0] : classId;

  const classes = useTimetableStore((state) => state.classes);
  const files = useDriveStore((state) => state.files);
  const addFile = useDriveStore((state) => state.addFile);
  const removeFile = useDriveStore((state) => state.removeFile);
  const setAiMeta = useDriveStore((state) => state.setAiMeta);

  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(undefined);
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);

  useEffect(() => {
    if (!linkedClassId) return;
    if (classes.some((item) => item.id === linkedClassId)) {
      setSelectedClassId(linkedClassId);
    }
  }, [classes, linkedClassId]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof files>();
    for (const file of files) {
      const key = file.folderPath;
      const group = map.get(key) ?? [];
      group.push(file);
      map.set(key, group);
    }
    return Array.from(map.entries());
  }, [files]);

  const pickFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ multiple: true, copyToCacheDirectory: true });
      if (result.canceled) return;

      const classItem = selectedClassId ? classes.find((item) => item.id === selectedClassId) : undefined;
      const folderPath = classItem ? `/classes/${classItem.name}` : '/inbox';

      for (const asset of result.assets) {
        addFile({
          classId: selectedClassId,
          name: asset.name,
          uri: asset.uri,
          size: asset.size,
          mimeType: asset.mimeType,
          folderPath,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '파일 선택 중 오류가 발생했습니다.';
      Alert.alert('파일 오류', message);
    }
  };

  const tagByAi = async (fileId: string) => {
    const file = files.find((item) => item.id === fileId);
    if (!file) return;

    setLoadingFileId(fileId);
    try {
      const prompt = [
        '아래 파일명을 기반으로 학습 분류 태그와 요약을 작성해줘.',
        '- 태그 5개',
        '- 한 줄 요약',
        `파일명: ${file.name}`,
        `mime: ${file.mimeType ?? 'unknown'}`,
        `folder: ${file.folderPath}`,
      ].join('\n');

      const result = await runAiTask('summary', prompt);
      const output = result.output || '';
      const tags = parseTags(output);
      setAiMeta(fileId, tags, output);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AI 태깅 중 오류가 발생했습니다.';
      Alert.alert('AI 오류', message);
    } finally {
      setLoadingFileId(null);
    }
  };

  return (
    <AppScreen scroll title="Drive" contentStyle={styles.content}>
      <AppCard>
        <Text style={styles.sectionTitle}>업로드</Text>
        <Text style={styles.label}>폴더</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowScroll}>
          <Text style={[styles.chip, !selectedClassId ? styles.chipActive : null]} onPress={() => setSelectedClassId(undefined)}>공용 Inbox</Text>
          {classes.map((item) => (
            <Text key={item.id} style={[styles.chip, selectedClassId === item.id ? styles.chipActive : null]} onPress={() => setSelectedClassId(item.id)}>
              {item.name}
            </Text>
          ))}
        </ScrollView>
        <AppButton label="파일 추가" onPress={pickFiles} />
      </AppCard>

      <AppCard>
        <Text style={styles.sectionTitle}>폴더 트리</Text>
        <View style={styles.treeWrap}>
          {grouped.length === 0 ? <Text style={styles.empty}>없음</Text> : null}
          {grouped.map(([folder, group]) => (
            <View key={folder} style={styles.folderBlock}>
              <Text style={styles.folderTitle}>{folder}</Text>
              <View style={styles.fileList}>
                {group.map((file) => (
                  <View key={file.id} style={styles.fileItem}>
                    <Text style={styles.fileName}>{file.name}</Text>
                    <Text style={styles.fileMeta}>{file.mimeType ?? 'unknown'} · {file.size ?? 0} bytes</Text>
                    <Text style={styles.fileTags}>{file.aiTags.length ? `#${file.aiTags.join(' #')}` : '태그 없음'}</Text>
                    <Text numberOfLines={2} style={styles.fileSummary}>{file.summary || '요약 없음'}</Text>
                    <View style={styles.rowButtons}>
                      <AppButton
                        label={loadingFileId === file.id ? '분석 중' : 'AI 태깅'}
                        size="sm"
                        variant="secondary"
                        onPress={() => tagByAi(file.id)}
                        disabled={loadingFileId === file.id}
                      />
                      <AppButton label="삭제" size="sm" variant="danger" onPress={() => removeFile(file.id)} />
                    </View>
                  </View>
                ))}
              </View>
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
  treeWrap: { marginTop: 8, gap: 10 },
  empty: { color: colors.textMuted, fontSize: 13 },
  folderBlock: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 10, backgroundColor: colors.surface },
  folderTitle: { color: colors.text, fontSize: 13, fontWeight: '800' },
  fileList: { marginTop: 8, gap: 8 },
  fileItem: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 9, backgroundColor: '#FFFFFF' },
  fileName: { color: colors.text, fontSize: 13, fontWeight: '700' },
  fileMeta: { marginTop: 3, color: colors.textSubtle, fontSize: 11 },
  fileTags: { marginTop: 5, color: colors.primaryStrong, fontSize: 11, fontWeight: '700' },
  fileSummary: { marginTop: 5, color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  rowButtons: { marginTop: 8, flexDirection: 'row', gap: 8 },
});
