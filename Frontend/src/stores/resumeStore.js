import { create } from 'zustand';
import { resumeAPI } from '../lib/api';

export const useResumeStore = create((set) => ({
  resumes: [],
  activeResume: null,
  scoreCard: null,
  isLoading: false,
  isUploading: false,
  error: null,

  fetchResumes: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await resumeAPI.getAll();
      set({ resumes: res.data.resumes, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err.message });
    }
  },

  fetchResume: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await resumeAPI.getById(id);
      set({ activeResume: res.data.resume, isLoading: false });
      return res.data.resume;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      return null;
    }
  },

  fetchScore: async (id) => {
    try {
      const res = await resumeAPI.getScore(id);
      set({ scoreCard: res.data });
      return res.data;
    } catch (err) {
      set({ error: err.message });
      return null;
    }
  },

  uploadResume: async (file, targetRole) => {
    set({ isUploading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('resume', file);
      if (targetRole) formData.append('targetRole', targetRole);

      const res = await resumeAPI.upload(formData);
      const newResume = res.data.resume;

      set((state) => ({
        resumes: [newResume, ...state.resumes],
        activeResume: newResume,
        scoreCard: res.data.scoreCard,
        isUploading: false,
      }));

      return newResume;
    } catch (err) {
      set({ isUploading: false, error: err.message });
      return null;
    }
  },

  parseText: async (resumeText, targetRole) => {
    set({ isUploading: true, error: null });
    try {
      const res = await resumeAPI.parseText({ resumeText, targetRole });
      const newResume = res.data.resume;

      set((state) => ({
        resumes: [newResume, ...state.resumes],
        activeResume: newResume,
        scoreCard: res.data.scoreCard,
        isUploading: false,
      }));

      return newResume;
    } catch (err) {
      set({ isUploading: false, error: err.message });
      return null;
    }
  },

  clearActive: () => set({ activeResume: null, scoreCard: null }),
  clearError: () => set({ error: null }),
}));
