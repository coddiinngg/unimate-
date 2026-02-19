import { create } from 'zustand';
import { SlideDeck, SlideItem } from '../types/models';
import { uid } from '../utils/id';

interface CreateDeckInput {
  classId?: string;
  title: string;
  topic: string;
  rawOutline: string;
}

function parseSlides(raw: string): SlideItem[] {
  const lines = raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const slides: SlideItem[] = [];
  let order = 1;

  for (const line of lines) {
    if (slides.length >= 12) break;
    const title = line.replace(/^[-*\d.\s]+/, '').trim();
    if (!title) continue;
    slides.push({
      id: uid(),
      order,
      title,
      bullets: [
        '핵심 개념 정리',
        '예시 또는 사례',
        '발표 시 강조 포인트',
      ],
    });
    order += 1;
  }

  if (!slides.length) {
    slides.push({
      id: uid(),
      order: 1,
      title: '도입',
      bullets: ['주제 배경', '문제 정의', '목표'],
    });
    slides.push({
      id: uid(),
      order: 2,
      title: '핵심 내용',
      bullets: ['핵심 아이디어 1', '핵심 아이디어 2', '핵심 아이디어 3'],
    });
  }

  return slides;
}

interface SlidesState {
  decks: SlideDeck[];
  activeDeckId: string | null;
  createDeck: (input: CreateDeckInput) => string;
  setActiveDeck: (deckId: string) => void;
  removeDeck: (deckId: string) => void;
  updateSlide: (deckId: string, slideId: string, patch: Partial<Pick<SlideItem, 'title' | 'bullets'>>) => void;
  getActiveDeck: () => SlideDeck | null;
}

export const useSlidesStore = create<SlidesState>((set, get) => ({
  decks: [],
  activeDeckId: null,

  createDeck: ({ classId, title, topic, rawOutline }) => {
    const deck: SlideDeck = {
      id: uid(),
      classId,
      title,
      topic,
      rawOutline,
      slides: parseSlides(rawOutline),
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      decks: [deck, ...state.decks],
      activeDeckId: deck.id,
    }));

    return deck.id;
  },

  setActiveDeck: (deckId) => set({ activeDeckId: deckId }),

  removeDeck: (deckId) =>
    set((state) => {
      const nextDecks = state.decks.filter((deck) => deck.id !== deckId);
      const nextActive = state.activeDeckId === deckId ? (nextDecks[0]?.id ?? null) : state.activeDeckId;
      return {
        decks: nextDecks,
        activeDeckId: nextActive,
      };
    }),

  updateSlide: (deckId, slideId, patch) =>
    set((state) => ({
      decks: state.decks.map((deck) =>
        deck.id === deckId
          ? {
              ...deck,
              slides: deck.slides.map((slide) =>
                slide.id === slideId
                  ? {
                      ...slide,
                      ...patch,
                    }
                  : slide,
              ),
            }
          : deck,
      ),
    })),

  getActiveDeck: () => {
    const state = get();
    if (!state.activeDeckId) return null;
    return state.decks.find((deck) => deck.id === state.activeDeckId) ?? null;
  },
}));
