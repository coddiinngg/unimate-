import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { SlideDeck } from '../../types/models';

function buildPlainText(deck: SlideDeck) {
  return deck.slides
    .map((slide) => {
      const bullets = slide.bullets.map((bullet) => `- ${bullet}`).join('\n');
      return `# ${slide.order}. ${slide.title}\n${bullets}`;
    })
    .join('\n\n');
}

export async function exportDeck(deck: SlideDeck) {
  if (!FileSystem.documentDirectory) {
    throw new Error('파일 저장 경로를 찾지 못했습니다.');
  }

  const safeBase = deck.title.replace(/[^a-zA-Z0-9가-힣_-]/g, '_').slice(0, 32) || 'slides';

  try {
    const mod = await import('pptxgenjs');
    const Pptx = (mod as any).default ?? mod;
    const pptx = new Pptx();
    pptx.layout = 'LAYOUT_WIDE';

    for (const slideItem of deck.slides) {
      const slide = pptx.addSlide();
      slide.addText(slideItem.title, {
        x: 0.6,
        y: 0.4,
        w: 12,
        h: 0.8,
        fontSize: 28,
        bold: true,
      });
      slide.addText(slideItem.bullets.map((bullet) => `• ${bullet}`).join('\n'), {
        x: 0.9,
        y: 1.4,
        w: 11.3,
        h: 4.8,
        fontSize: 18,
        breakLine: true,
      });
    }

    const base64 = (await pptx.write({ outputType: 'base64' })) as string;
    const fileUri = `${FileSystem.documentDirectory}${safeBase}.pptx`;
    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        dialogTitle: '슬라이드 파일 공유',
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        UTI: 'org.openxmlformats.presentationml.presentation',
      });
    }

    return { fileUri, usedFallback: false };
  } catch {
    const textUri = `${FileSystem.documentDirectory}${safeBase}.txt`;
    await FileSystem.writeAsStringAsync(textUri, buildPlainText(deck), {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(textUri, {
        dialogTitle: '슬라이드 텍스트 공유',
        mimeType: 'text/plain',
      });
    }

    return { fileUri: textUri, usedFallback: true };
  }
}
