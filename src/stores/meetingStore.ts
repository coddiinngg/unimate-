import { create } from 'zustand';
import { MeetingRecord } from '../types/models';
import { uid } from '../utils/id';

interface CreateMeetingInput {
  classId?: string;
  title: string;
  audioUri: string;
  durationMillis: number;
  transcript: string;
  summary: string;
}

interface MeetingState {
  meetings: MeetingRecord[];
  addMeeting: (input: CreateMeetingInput) => string;
  getMeetingsByClassId: (classId: string) => MeetingRecord[];
}

export const useMeetingStore = create<MeetingState>((set, get) => ({
  meetings: [],

  addMeeting: ({ classId, title, audioUri, durationMillis, transcript, summary }) => {
    const item: MeetingRecord = {
      id: uid(),
      classId,
      title,
      audioUri,
      durationMillis,
      transcript,
      summary,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({ meetings: [item, ...state.meetings] }));
    return item.id;
  },

  getMeetingsByClassId: (classId) => get().meetings.filter((item) => item.classId === classId),
}));
