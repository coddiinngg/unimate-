import { requestClaude } from './claude';
import { requestOpenAI } from './openai';

export type AiTask = 'chat' | 'document' | 'slides' | 'summary' | 'problems' | 'image' | 'transcribe';

export async function runAiTask(task: AiTask, input: string) {
  if (task === 'image' || task === 'transcribe') {
    return requestOpenAI(task, input);
  }
  return requestClaude(task, input);
}
