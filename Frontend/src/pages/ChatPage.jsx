import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Rocket, Sparkles, Target, Briefcase, FileText } from 'lucide-react';
import { useChatStore } from '../stores/chatStore';
import { useResumeStore } from '../stores/resumeStore';
import ChatBubble, { TypingIndicator } from '../components/ChatBubble';
import LoadingSpinner from '../components/LoadingSpinner';

function ChatPage() {
  const { session, messages, isTyping, sessionState, isLoading, error, loadActiveSession, sendMessage } = useChatStore();
  const { resumes, fetchResumes } = useResumeStore();
  
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadActiveSession();
    fetchResumes(); // Just in case we need context
  }, [loadActiveSession, fetchResumes]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const msg = input.trim();
    setInput('');
    await sendMessage(msg);
  };

  // Map state to human-readable label
  const stateLabels = {
    ONBOARDING: 'Welcome',
    PARSING: 'Analyzing',
    SCORE_DELIVERED: 'Score Review',
    JD_MATCHING: 'Job Matching',
    INTERVIEW_MODE: 'Optimization',
    OPTIMIZATION_COMPLETE: 'Ready',
    JOB_SEARCH: 'Job Search',
    COVER_LETTER: 'Cover Letter',
  };

  const getSuggestedActions = () => {
    switch (sessionState) {
      case 'SCORE_DELIVERED':
      case 'OPTIMIZATION_COMPLETE':
        return [
          { label: 'Improve my bullets', action: 'I want to improve my bullet points', icon: Sparkles, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
          { label: 'Match a JD', action: 'I want to match my resume to a job description', icon: Target, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
          { label: 'Find Jobs', action: 'Search for jobs matching my profile', icon: Briefcase, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Cover Letter', action: 'Generate a cover letter', icon: FileText, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
        ];
      case 'INTERVIEW_MODE':
        return [
          { label: 'Accept Draft', action: 'The draft looks good, let\'s accept it.', icon: Sparkles, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Make it punchier', action: 'Make it punchier and more concise.', icon: Sparkles, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
        ];
      default:
        return [];
    }
  };

  if (isLoading && !session) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Connecting to AI Coach..." />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-100px)] lg:h-[calc(100vh-64px)] flex flex-col glass-panel overflow-hidden animate-in">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/[0.06] bg-dark-100/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 shadow-glow-cyan flex items-center justify-center">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">AntiGravity Coach</h2>
            <div className="flex items-center gap-2">
              <span className="flex w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              <span className="text-xs font-medium text-emerald-400">Online</span>
            </div>
          </div>
        </div>

        {/* State Badge */}
        {sessionState && (
          <div className="hidden sm:flex items-center px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
            <span className="text-xs text-gray-400 font-medium tracking-wider uppercase">
              Phase: <span className="text-cyan-400">{stateLabels[sessionState] || sessionState}</span>
            </span>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <ChatBubble key={idx} message={msg} index={idx} />
          ))}
        </AnimatePresence>

        {isTyping && (
          <div className="pb-4">
            <TypingIndicator />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Actions */}
      {getSuggestedActions().length > 0 && !isTyping && (
        <div className="px-4 md:px-6 py-3 border-t border-white/[0.02]">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Suggested Actions</p>
          <div className="flex flex-wrap gap-2">
            {getSuggestedActions().map((action, i) => {
              const Icon = action.icon;
              return (
                <button
                  key={i}
                  onClick={() => sendMessage(action.action)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-transform hover:scale-105 active:scale-95 ${action.color}`}
                >
                  <Icon className="w-4 h-4" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-dark-100/50 border-t border-white/[0.06]">
        {error && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            placeholder="Type your message..."
            className="w-full bg-dark border border-white/[0.1] rounded-2xl pl-5 pr-14 py-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-2 bottom-2 w-10 flex items-center justify-center rounded-xl bg-gradient-accent hover:bg-gradient-accent-hover text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatPage;
