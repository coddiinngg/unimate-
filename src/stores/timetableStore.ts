import { create } from 'zustand';
import { ClassItem, TimetableSlot, Weekday } from '../types/models';
import { uid } from '../utils/id';

interface CreateClassInput {
  name: string;
  professor: string;
  location: string;
  day: Weekday;
  startHour: number;
  endHour: number;
  color?: string;
}

interface TimetableState {
  semester: string;
  classes: ClassItem[];
  slots: TimetableSlot[];
  addClassWithSlot: (input: CreateClassInput) => void;
  removeClass: (classId: string) => void;
  getClassById: (classId: string) => ClassItem | undefined;
  getSlotsByClassId: (classId: string) => TimetableSlot[];
}

const sampleClassId = 'seed-algo';

export const useTimetableStore = create<TimetableState>((set, get) => ({
  semester: '2026-1',
  classes: [
    {
      id: sampleClassId,
      name: '알고리즘',
      professor: '김교수',
      location: '공학관 301',
      color: '#38BDF8',
      semester: '2026-1',
    },
  ],
  slots: [
    {
      id: 'seed-slot-1',
      classId: sampleClassId,
      day: 'Tue',
      startHour: 10,
      endHour: 12,
    },
  ],
  addClassWithSlot: ({ name, professor, location, day, startHour, endHour, color }) =>
    set((state) => {
      const classId = uid();
      const newClass: ClassItem = {
        id: classId,
        name,
        professor,
        location,
        color: color ?? '#60A5FA',
        semester: state.semester,
      };
      const newSlot: TimetableSlot = {
        id: uid(),
        classId,
        day,
        startHour,
        endHour,
      };
      return {
        classes: [...state.classes, newClass],
        slots: [...state.slots, newSlot],
      };
    }),
  removeClass: (classId) =>
    set((state) => ({
      classes: state.classes.filter((item) => item.id !== classId),
      slots: state.slots.filter((slot) => slot.classId !== classId),
    })),
  getClassById: (classId) => get().classes.find((item) => item.id === classId),
  getSlotsByClassId: (classId) => get().slots.filter((slot) => slot.classId === classId),
}));
