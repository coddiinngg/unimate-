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
  isStreaming?: boolean;
}

export interface ChatConversation {
  id: string;
  title: string;
  classId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingRecord {
  id: string;
  classId?: string;
  title: string;
  audioUri: string;
  durationMillis: number;
  transcript: string;
  summary: string;
  createdAt: string;
}

export interface VideoSummaryItem {
  id: string;
  classId?: string;
  sourceUrl: string;
  videoId: string;
  transcript: string;
  summary: string;
  keyPoints: string[];
  createdAt: string;
}

export interface ProblemItem {
  id: string;
  prompt: string;
  order: number;
}

export interface ProblemSet {
  id: string;
  classId?: string;
  title: string;
  topic: string;
  rawText: string;
  problems: ProblemItem[];
  createdAt: string;
}

export interface ProblemAttempt {
  id: string;
  setId: string;
  answers: Record<string, string>;
  score: number;
  feedback: string;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  classId?: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface SlideItem {
  id: string;
  order: number;
  title: string;
  bullets: string[];
}

export interface SlideDeck {
  id: string;
  classId?: string;
  title: string;
  topic: string;
  rawOutline: string;
  slides: SlideItem[];
  createdAt: string;
}

export interface DesignItem {
  id: string;
  classId?: string;
  title: string;
  prompt: string;
  style: string;
  imageUrl?: string;
  notes: string;
  createdAt: string;
}

export interface SchedulerEvent {
  id: string;
  classId?: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'class' | 'assignment' | 'exam' | 'meeting' | 'personal';
  note?: string;
  createdAt: string;
}

export interface DriveFile {
  id: string;
  classId?: string;
  name: string;
  uri: string;
  size?: number;
  mimeType?: string;
  folderPath: string;
  aiTags: string[];
  summary: string;
  createdAt: string;
}
