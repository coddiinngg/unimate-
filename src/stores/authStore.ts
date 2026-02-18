import { create } from 'zustand';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  university?: string;
  major?: string;
  grade?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  hasOnboarded: boolean;
  user: UserProfile | null;
  login: (payload: { email: string; name?: string }) => void;
  register: (payload: { email: string; name: string; university?: string }) => void;
  completeOnboarding: (payload: { major: string; grade: string; university: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  hasOnboarded: false,
  user: null,
  login: ({ email, name }) =>
    set({
      isAuthenticated: true,
      user: { id: 'local-user', email, name: name ?? '학생' },
    }),
  register: ({ email, name, university }) =>
    set({
      isAuthenticated: true,
      hasOnboarded: false,
      user: { id: 'local-user', email, name, university },
    }),
  completeOnboarding: ({ major, grade, university }) =>
    set((state) => ({
      hasOnboarded: true,
      user: state.user
        ? {
            ...state.user,
            major,
            grade,
            university,
          }
        : null,
    })),
  logout: () => set({ isAuthenticated: false, hasOnboarded: false, user: null }),
}));
