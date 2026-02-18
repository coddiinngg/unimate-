export type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';

export interface ClassItem {
  id: string;
  name: string;
  professor: string;
  location: string;
  color: string;
  semester: string;
}

export interface TimetableSlot {
  id: string;
  classId: string;
  day: Weekday;
  startHour: number;
  endHour: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}
