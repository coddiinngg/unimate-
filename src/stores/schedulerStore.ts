import { create } from 'zustand';
import { SchedulerEvent } from '../types/models';
import { uid } from '../utils/id';

interface CreateSchedulerEventInput {
  classId?: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'class' | 'assignment' | 'exam' | 'meeting' | 'personal';
  note?: string;
}

interface SchedulerState {
  events: SchedulerEvent[];
  recommendationsByDate: Record<string, string>;
  addEvent: (input: CreateSchedulerEventInput) => string;
  removeEvent: (eventId: string) => void;
  setRecommendation: (date: string, text: string) => void;
}

export const useSchedulerStore = create<SchedulerState>((set) => ({
  events: [],
  recommendationsByDate: {},

  addEvent: ({ classId, title, date, startTime, endTime, type, note }) => {
    const event: SchedulerEvent = {
      id: uid(),
      classId,
      title,
      date,
      startTime,
      endTime,
      type,
      note,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({ events: [event, ...state.events] }));
    return event.id;
  },

  removeEvent: (eventId) =>
    set((state) => ({
      events: state.events.filter((event) => event.id !== eventId),
    })),

  setRecommendation: (date, text) =>
    set((state) => ({
      recommendationsByDate: {
        ...state.recommendationsByDate,
        [date]: text,
      },
    })),
}));
