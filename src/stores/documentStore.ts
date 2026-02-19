import { create } from 'zustand';
import { DocumentItem } from '../types/models';
import { uid } from '../utils/id';

interface CreateDocumentInput {
  classId?: string;
  title?: string;
  content?: string;
}

interface DocumentState {
  documents: DocumentItem[];
  activeDocumentId: string | null;
  createDocument: (input?: CreateDocumentInput) => string;
  deleteDocument: (documentId: string) => void;
  setActiveDocument: (documentId: string) => void;
  updateDocument: (documentId: string, patch: Partial<Pick<DocumentItem, 'title' | 'content'>>) => void;
  getActiveDocument: () => DocumentItem | null;
}

function buildDocument(input?: CreateDocumentInput): DocumentItem {
  const now = new Date().toISOString();
  return {
    id: uid(),
    classId: input?.classId,
    title: input?.title?.trim() || '새 문서',
    content: input?.content ?? '',
    createdAt: now,
    updatedAt: now,
  };
}

export const useDocumentStore = create<DocumentState>((set, get) => {
  const seeded = buildDocument({ title: '환영 문서', content: '# UniMate 문서\n\nAI로 초안을 만들어보세요.' });

  return {
    documents: [seeded],
    activeDocumentId: seeded.id,

    createDocument: (input) => {
      const item = buildDocument(input);
      set((state) => ({
        documents: [item, ...state.documents],
        activeDocumentId: item.id,
      }));
      return item.id;
    },

    deleteDocument: (documentId) =>
      set((state) => {
        const next = state.documents.filter((item) => item.id !== documentId);
        if (!next.length) {
          const fallback = buildDocument();
          return { documents: [fallback], activeDocumentId: fallback.id };
        }
        const nextActive = state.activeDocumentId === documentId ? next[0].id : state.activeDocumentId;
        return {
          documents: next,
          activeDocumentId: nextActive,
        };
      }),

    setActiveDocument: (documentId) => set({ activeDocumentId: documentId }),

    updateDocument: (documentId, patch) =>
      set((state) => ({
        documents: state.documents.map((item) =>
          item.id === documentId
            ? {
                ...item,
                ...patch,
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      })),

    getActiveDocument: () => {
      const state = get();
      if (!state.activeDocumentId) return null;
      return state.documents.find((item) => item.id === state.activeDocumentId) ?? null;
    },
  };
});
