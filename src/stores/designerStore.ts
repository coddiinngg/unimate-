import { create } from 'zustand';
import { DesignItem } from '../types/models';
import { uid } from '../utils/id';

interface CreateDesignInput {
  classId?: string;
  title: string;
  prompt: string;
  style: string;
  imageUrl?: string;
  notes: string;
}

interface DesignerState {
  designs: DesignItem[];
  addDesign: (input: CreateDesignInput) => string;
  removeDesign: (designId: string) => void;
}

export const useDesignerStore = create<DesignerState>((set) => ({
  designs: [],

  addDesign: ({ classId, title, prompt, style, imageUrl, notes }) => {
    const item: DesignItem = {
      id: uid(),
      classId,
      title,
      prompt,
      style,
      imageUrl,
      notes,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({ designs: [item, ...state.designs] }));
    return item.id;
  },

  removeDesign: (designId) =>
    set((state) => ({
      designs: state.designs.filter((item) => item.id !== designId),
    })),
}));
