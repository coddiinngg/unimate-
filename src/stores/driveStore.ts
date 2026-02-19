import { create } from 'zustand';
import { DriveFile } from '../types/models';
import { uid } from '../utils/id';

interface AddDriveFileInput {
  classId?: string;
  name: string;
  uri: string;
  size?: number;
  mimeType?: string;
  folderPath: string;
}

interface DriveState {
  files: DriveFile[];
  addFile: (input: AddDriveFileInput) => string;
  removeFile: (fileId: string) => void;
  setAiMeta: (fileId: string, aiTags: string[], summary: string) => void;
}

export const useDriveStore = create<DriveState>((set) => ({
  files: [],

  addFile: ({ classId, name, uri, size, mimeType, folderPath }) => {
    const file: DriveFile = {
      id: uid(),
      classId,
      name,
      uri,
      size,
      mimeType,
      folderPath,
      aiTags: [],
      summary: '',
      createdAt: new Date().toISOString(),
    };

    set((state) => ({ files: [file, ...state.files] }));
    return file.id;
  },

  removeFile: (fileId) =>
    set((state) => ({
      files: state.files.filter((item) => item.id !== fileId),
    })),

  setAiMeta: (fileId, aiTags, summary) =>
    set((state) => ({
      files: state.files.map((item) =>
        item.id === fileId
          ? {
              ...item,
              aiTags,
              summary,
            }
          : item,
      ),
    })),
}));
