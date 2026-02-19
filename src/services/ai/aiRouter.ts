import { requestClaude } from './claude';
import { hasOpenAIKey } from './openaiConnection';
import { requestOpenAI } from './openai';

export type AiTask = 'chat' | 'document' | 'slides' | 'summary' | 'problems' | 'image' | 'transcribe';

export async function runAiTask(task: AiTask, input: string) {
  const hasOpenAI = await hasOpenAIKey();

  if (task === 'image') {
    return requestOpenAI(task, input);
  }
  if (task === 'transcribe') {
    if (hasOpenAI) return requestOpenAI(task, input);
    return requestClaude(task, input);
  }
  if (hasOpenAI) {
    return requestOpenAI(task, input);
  }
  return requestClaude(task, input);
}
