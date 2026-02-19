import { create } from 'zustand';
import { ProblemAttempt, ProblemItem, ProblemSet } from '../types/models';
import { uid } from '../utils/id';

interface CreateProblemSetInput {
  classId?: string;
  title: string;
  topic: string;
  generatedRaw: string;
}

interface SubmitAttemptInput {
  setId: string;
  answers: Record<string, string>;
  score: number;
  feedback: string;
}

function parseProblems(raw: string): ProblemItem[] {
  const lines = raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const result: ProblemItem[] = [];
  let index = 1;

  for (const line of lines) {
    if (result.length >= 5) break;
    const normalized = line.replace(/^[-*\d.\s]+/, '').trim();
    if (!normalized) continue;
    result.push({ id: uid(), prompt: normalized, order: index });
    index += 1;
  }

  if (!result.length) {
    result.push({ id: uid(), prompt: '생성 결과를 파싱하지 못해 기본 문제를 생성했습니다. 핵심 개념을 설명하세요.', order: 1 });
  }

  return result;
}

interface ProblemState {
  sets: ProblemSet[];
  attempts: ProblemAttempt[];
  createSet: (input: CreateProblemSetInput) => string;
  submitAttempt: (input: SubmitAttemptInput) => string;
  getSetById: (setId: string) => ProblemSet | undefined;
  getAttemptsBySetId: (setId: string) => ProblemAttempt[];
}

export const useProblemStore = create<ProblemState>((set, get) => ({
  sets: [],
  attempts: [],

  createSet: ({ classId, title, topic, generatedRaw }) => {
    const now = new Date().toISOString();
    const setItem: ProblemSet = {
      id: uid(),
      classId,
      title,
      topic,
      rawText: generatedRaw,
      problems: parseProblems(generatedRaw),
      createdAt: now,
    };
    set((state) => ({ sets: [setItem, ...state.sets] }));
    return setItem.id;
  },

  submitAttempt: ({ setId, answers, score, feedback }) => {
    const attempt: ProblemAttempt = {
      id: uid(),
      setId,
      answers,
      score,
      feedback,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ attempts: [attempt, ...state.attempts] }));
    return attempt.id;
  },

  getSetById: (setId) => get().sets.find((item) => item.id === setId),
  getAttemptsBySetId: (setId) => get().attempts.filter((item) => item.setId === setId),
}));
