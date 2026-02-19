import { create } from 'zustand';
import { VideoSummaryItem } from '../types/models';
import { uid } from '../utils/id';

interface CreateVideoSummaryInput {
  classId?: string;
  sourceUrl: string;
  videoId: string;
  transcript: string;
  summary: string;
  keyPoints: string[];
}

interface VideoSummaryState {
  summaries: VideoSummaryItem[];
  addSummary: (input: CreateVideoSummaryInput) => string;
  getByClassId: (classId: string) => VideoSummaryItem[];
}

export const useVideoSummaryStore = create<VideoSummaryState>((set, get) => ({
  summaries: [],

  addSummary: ({ classId, sourceUrl, videoId, transcript, summary, keyPoints }) => {
    const item: VideoSummaryItem = {
      id: uid(),
      classId,
      sourceUrl,
      videoId,
      transcript,
      summary,
      keyPoints,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({ summaries: [item, ...state.summaries] }));
    return item.id;
  },

  getByClassId: (classId) => get().summaries.filter((item) => item.classId === classId),
}));
