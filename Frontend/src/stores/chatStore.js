import { create } from 'zustand';
import { chatAPI } from '../lib/api';

export const useChatStore = create((set, get) => ({
  session: null,
  messages: [],
  isTyping: false,
  sessionState: 'ONBOARDING',
  isLoading: false,
  error: null,

  loadActiveSession: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await chatAPI.getActive();
      const session = res.data.session;
      set({
        session,
        messages: session.conversationHistory || [],
        sessionState: session.state,
        isLoading: false,
      });
      return session;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      return null;
    }
  },

  startNewSession: async (resumeId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await chatAPI.startSession({ resumeId });
      const session = res.data.session;
      set({
        session,
        messages: session.conversationHistory || [],
        sessionState: session.state,
        isLoading: false,
      });
      return session;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      return null;
    }
  },

  sendMessage: async (message) => {
    const { session } = get();
    if (!session) return null;

    // Optimistically add user message
    const userMsg = { role: 'user', content: message, timestamp: new Date().toISOString() };
    set((state) => ({
      messages: [...state.messages, userMsg],
      isTyping: true,
      error: null,
    }));

    try {
      const res = await chatAPI.sendMessage({
        message,
        sessionId: session.id,
      });

      const assistantMsg = {
        role: 'assistant',
        content: res.data.reply,
        timestamp: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, assistantMsg],
        session: res.data.session,
        sessionState: res.data.session.state,
        isTyping: false,
      }));

      return res.data.reply;
    } catch (err) {
      set({ isTyping: false, error: err.message });
      return null;
    }
  },

  clearChat: () => set({ session: null, messages: [], sessionState: 'ONBOARDING' }),
  clearError: () => set({ error: null }),
}));
