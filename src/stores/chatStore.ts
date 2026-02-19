import { create } from 'zustand';
import { ChatConversation, ChatMessage } from '../types/models';
import { uid } from '../utils/id';

interface CreateConversationInput {
  title?: string;
  classId?: string;
}

interface ChatState {
  conversations: ChatConversation[];
  messagesByConversation: Record<string, ChatMessage[]>;
  activeConversationId: string | null;
  createConversation: (input?: CreateConversationInput) => string;
  ensureConversationForClass: (classId: string) => string;
  deleteConversation: (conversationId: string) => void;
  setActiveConversation: (conversationId: string) => void;
  addUserMessage: (conversationId: string, content: string) => void;
  startAssistantMessage: (conversationId: string) => string;
  appendAssistantChunk: (conversationId: string, messageId: string, chunk: string) => void;
  finishAssistantMessage: (conversationId: string, messageId: string) => void;
}

function nowIso() {
  return new Date().toISOString();
}

function buildConversation(input?: CreateConversationInput): ChatConversation {
  const now = nowIso();
  return {
    id: uid(),
    title: input?.title?.trim() || '새 대화',
    classId: input?.classId,
    createdAt: now,
    updatedAt: now,
  };
}

const seededConversation = buildConversation({ title: '환영 대화' });

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [seededConversation],
  messagesByConversation: {
    [seededConversation.id]: [
      {
        id: uid(),
        role: 'assistant',
        content: '안녕하세요. UniMate 채팅입니다. 수업과 연결해서 질문해보세요.',
        createdAt: nowIso(),
      },
    ],
  },
  activeConversationId: seededConversation.id,

  createConversation: (input) => {
    const conversation = buildConversation(input);
    set((state) => ({
      conversations: [conversation, ...state.conversations],
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversation.id]: [],
      },
      activeConversationId: conversation.id,
    }));
    return conversation.id;
  },

  ensureConversationForClass: (classId) => {
    const found = get().conversations.find((item) => item.classId === classId);
    if (found) {
      set({ activeConversationId: found.id });
      return found.id;
    }
    return get().createConversation({ classId, title: '수업 연결 대화' });
  },

  deleteConversation: (conversationId) =>
    set((state) => {
      const nextConversations = state.conversations.filter((item) => item.id !== conversationId);
      const nextMessages = { ...state.messagesByConversation };
      delete nextMessages[conversationId];

      let nextActiveConversationId = state.activeConversationId;
      if (!nextConversations.length) {
        const fallback = buildConversation({ title: '새 대화' });
        return {
          conversations: [fallback],
          messagesByConversation: {
            [fallback.id]: [],
          },
          activeConversationId: fallback.id,
        };
      }

      if (state.activeConversationId === conversationId) {
        nextActiveConversationId = nextConversations[0].id;
      }

      return {
        conversations: nextConversations,
        messagesByConversation: nextMessages,
        activeConversationId: nextActiveConversationId,
      };
    }),

  setActiveConversation: (conversationId) => set({ activeConversationId: conversationId }),

  addUserMessage: (conversationId, content) =>
    set((state) => {
      const existing = state.messagesByConversation[conversationId] ?? [];
      const now = nowIso();
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: [
            ...existing,
            {
              id: uid(),
              role: 'user',
              content,
              createdAt: now,
            },
          ],
        },
        conversations: state.conversations.map((item) =>
          item.id === conversationId
            ? {
                ...item,
                title: item.title === '새 대화' && content.trim() ? content.slice(0, 24) : item.title,
                updatedAt: now,
              }
            : item,
        ),
      };
    }),

  startAssistantMessage: (conversationId) => {
    const id = uid();
    set((state) => {
      const existing = state.messagesByConversation[conversationId] ?? [];
      const now = nowIso();
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: [
            ...existing,
            {
              id,
              role: 'assistant',
              content: '',
              createdAt: now,
              isStreaming: true,
            },
          ],
        },
        conversations: state.conversations.map((item) =>
          item.id === conversationId
            ? {
                ...item,
                updatedAt: now,
              }
            : item,
        ),
      };
    });
    return id;
  },

  appendAssistantChunk: (conversationId, messageId, chunk) =>
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: (state.messagesByConversation[conversationId] ?? []).map((message) =>
          message.id === messageId
            ? {
                ...message,
                content: `${message.content}${chunk}`,
              }
            : message,
        ),
      },
    })),

  finishAssistantMessage: (conversationId, messageId) =>
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: (state.messagesByConversation[conversationId] ?? []).map((message) =>
          message.id === messageId
            ? {
                ...message,
                isStreaming: false,
              }
            : message,
        ),
      },
    })),
}));
