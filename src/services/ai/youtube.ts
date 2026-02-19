export interface CaptionSegment {
  startSec: number;
  text: string;
}

export interface ExtractedCaptionResult {
  videoId: string;
  transcript: string;
  segments: CaptionSegment[];
}

export function extractYouTubeId(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{6,})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{6,})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{6,})/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

export async function extractCaptionsFromYouTubeUrl(url: string): Promise<ExtractedCaptionResult> {
  const videoId = extractYouTubeId(url);
  if (!videoId) {
    throw new Error('유효한 YouTube URL이 아닙니다.');
  }

  // Phase 4 베이스: 자막 추출 파이프라인 자리. 실제 연동 전까지 샘플 자막을 생성한다.
  const segments: CaptionSegment[] = [
    { startSec: 0, text: '오늘 강의 주제는 운영체제의 프로세스 스케줄링입니다.' },
    { startSec: 18, text: '먼저 FCFS와 SJF를 비교하며 평균 대기 시간을 계산합니다.' },
    { startSec: 41, text: 'Round Robin에서는 타임퀀텀 설정이 응답 시간에 큰 영향을 줍니다.' },
    { startSec: 65, text: '실무에서는 워크로드 특성에 따라 멀티레벨 큐를 함께 사용합니다.' },
  ];

  const transcript = segments
    .map((segment) => `[${Math.floor(segment.startSec / 60)}:${(segment.startSec % 60).toString().padStart(2, '0')}] ${segment.text}`)
    .join('\n');

  return { videoId, transcript, segments };
}
