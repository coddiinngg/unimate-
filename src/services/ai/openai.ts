import { getOpenAIKey } from './openaiConnection';

const textTasks = new Set(['chat', 'document', 'slides', 'summary', 'problems']);

function getTaskInstruction(task: string) {
  if (task === 'chat') return '당신은 대학생 학습 도우미입니다. 핵심만 간결하게 답하세요.';
  if (task === 'document') return '입력 텍스트를 문서 스타일로 정리하세요.';
  if (task === 'slides') return '프레젠테이션 개요를 섹션별 불릿으로 작성하세요.';
  if (task === 'summary') return '핵심 요약을 5개 불릿 이내로 작성하세요.';
  if (task === 'problems') return '연습문제와 정답/해설을 함께 작성하세요.';
  return '입력 요청을 정확히 수행하세요.';
}

export async function requestOpenAI(task: string, input: string) {
  const apiKey = await getOpenAIKey();
  if (!apiKey) {
    return {
      provider: 'openai',
      task,
      output: 'OpenAI 키가 연결되지 않았습니다. 프로필에서 API 키를 등록하세요.',
    };
  }

  if (task === 'transcribe') {
    return {
      provider: 'openai',
      task,
      output: `Whisper mock transcript:\n${input}`,
    };
  }

  if (task === 'image') {
    return {
      provider: 'openai',
      task,
      output: '이미지 생성 요청이 접수되었습니다. 실제 이미지 API 연결은 다음 단계에서 활성화합니다.',
    };
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      input: [
        { role: 'system', content: getTaskInstruction(task) },
        { role: 'user', content: input },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI 요청 실패 (${response.status}): ${text.slice(0, 160)}`);
  }

  const data = (await response.json()) as { output_text?: string };
  return {
    provider: 'openai',
    task,
    output: data.output_text ?? '',
  };
}
