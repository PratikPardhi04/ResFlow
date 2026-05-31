import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Terminal, Loader2, Bot, User, CheckCircle2, XCircle } from 'lucide-react';
import { getActiveSession, startNewSession, getSessionHistory, sendMessage } from '../lib/api';

function LoadingDots() {
  return (
    <div className="flex gap-1 items-center px-4 py-3 bg-surface rounded-2xl w-fit">
      <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

function ChatMessage({ msg }) {
  const isUser = msg.role === 'user';
  const isSystem = msg.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-6">
        <span className="bg-zinc-800/50 text-zinc-400 px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest border border-zinc-700/50">
          {msg.content}
        </span>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded shrink-0 bg-accent/20 border border-accent/40 flex items-center justify-center text-accent mt-1">
          <Bot size={16} />
        </div>
      )}
      <div className={`max-w-[80%] rounded-2xl p-4 leading-relaxed whitespace-pre-wrap font-body text-[15px] shadow-lg
        ${isUser ? 'bg-accent text-background rounded-tr-sm ml-8' : 'bg-surface border border-zinc-800 text-zinc-200 rounded-tl-sm mr-8'}`}
      >
        {msg.content}

        {/* Rich Metadata Renders could go here based on msg.metadata */}
        {msg.metadata?.type === 'BULLET_REWRITE' && (
          <div className="mt-4 flex flex-col gap-2">
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-3 text-sm">
              <XCircle className="text-red-400 shrink-0 mt-0.5" size={16} />
              <span className="text-zinc-300">{msg.metadata.before}</span>
            </div>
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex gap-3 text-sm">
              <CheckCircle2 className="text-green-400 shrink-0 mt-0.5" size={16} />
              <span className="text-white font-medium">{msg.metadata.after}</span>
            </div>
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded flex items-center justify-center text-zinc-500 mt-1">
          <User size={16} />
        </div>
      )}
    </motion.div>
  );
}

const ACTION_CHIPS = {
  SCORE_DELIVERED: ['Optimize for ATS', 'Match a Job Description', 'Improve my Bullets', 'Find Jobs for my Skills'],
  OPTIMIZATION_COMPLETE: ['Generate Cover Letter', 'Find Matching Jobs', 'Start Over'],
  JD_MATCHING: [], // Handled by text area
  INTERVIEW_MODE: [] // Handled by UI specific prompt
};

export default function Coach() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const resumeId = searchParams.get('resumeId');
  const intent = searchParams.get('intent');

  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    async function init() {
      try {
        let active = null;
        try { active = await getActiveSession(); } catch(e) {}
        
        if (!active && resumeId) {
          active = await startNewSession(resumeId);
        } else if (!active && !resumeId) {
          // Can't start
          navigate('/dashboard');
          return;
        }

        setSession(active);
        const history = await getSessionHistory(active._id || active.id);
        setMessages(history.conversationHistory || []);
        
        // Handle pre-set intent if requested on new load
        if (intent && history.conversationHistory?.length <= 1) {
          handleSend(intent);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async (textOverride) => {
    const text = typeof textOverride === 'string' ? textOverride : inputVal;
    if (!text.trim() || isTyping) return;

    setInputVal('');
    const userMsg = { role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await sendMessage(session._id || session.id, text);
      const newMsgs = response.conversationHistory; // server returns updated history
      setMessages(newMsgs);
      setSession(prev => ({ ...prev, state: response.state }));
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'system', content: 'SYSTEM ERROR: Connection to AI core lost.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center font-mono text-accent">Establishing secure link...</div>;

  const currentChips = ACTION_CHIPS[session?.state] || [];
  const isJDMode = session?.state === 'JD_MATCHING';

  return (
    <div className="min-h-screen bg-background flex flex-col h-screen fixed inset-0">
      <header className="h-16 shrink-0 border-b border-zinc-800/80 bg-background/95 backdrop-blur z-20 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Terminal className="text-accent" size={20} />
          <h1 className="font-display font-medium text-white tracking-widest uppercase">Coach Terminal</h1>
        </div>
        <div className="flex gap-3">
          <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded font-mono text-xs text-zinc-400 hidden sm:flex items-center">
            RESUME: {session?.resumeId?.substring(0,8) || 'ACTIVE'}
          </div>
          <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded text-accent font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            STATE: {session?.state || 'IDLE'}
          </div>
        </div>
      </header>

      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth pb-32"
      >
        <div className="max-w-4xl mx-auto w-full">
          {messages.map((m, i) => <ChatMessage key={i} msg={m} />)}
          {isTyping && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 justify-start">
               <div className="w-8 h-8 rounded shrink-0 bg-accent/20 border border-accent/40 flex items-center justify-center text-accent mt-1">
                <Bot size={16} />
              </div>
              <LoadingDots />
            </motion.div>
          )}
        </div>
      </main>

      <footer className="shrink-0 border-t border-zinc-800/80 bg-background/95 backdrop-blur p-4 z-20 pb-[env(safe-area-inset-bottom,16px)]">
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-3">
          <div className="flex flex-wrap gap-2 mb-1 pl-[44px]">
            <AnimatePresence>
              {currentChips.map((chip) => (
                <motion.button
                  key={chip}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => handleSend(chip)}
                  className="px-3 py-1.5 bg-surface border border-zinc-700 hover:border-accent hover:text-accent rounded-full text-xs font-mono text-zinc-300 transition"
                >
                  {chip}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-3 relative"
          >
            <div className="absolute top-1/2 -translate-y-1/2 left-4 text-zinc-500">
              <span className="font-mono text-xs">{'>'}</span>
            </div>
            
            {isJDMode ? (
              <textarea 
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder="Paste Job Description here..."
                disabled={isTyping}
                className="flex-1 min-h-[80px] bg-surface/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-zinc-200 font-mono text-sm focus:outline-none focus:border-accent focus:bg-surface disabled:opacity-50 resize-none"
              />
            ) : (
              <input 
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder={session?.state === 'INTERVIEW_MODE' ? "Your answer..." : "Execute command..."}
                disabled={isTyping}
                className="flex-1 bg-surface/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-4 text-zinc-200 font-mono text-sm focus:outline-none focus:border-accent focus:bg-surface disabled:opacity-50"
              />
            )}
            
            <button 
              type="submit"
              disabled={!inputVal.trim() || isTyping}
              className="px-6 bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 text-background rounded-xl flex items-center justify-center transition"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}
