import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';

function ChatBubble({ message, index = 0 }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
          isUser
            ? 'bg-gradient-to-br from-violet-500 to-cyan-500'
            : 'bg-gradient-to-br from-cyan-500 to-emerald-500'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/15 text-gray-100 border border-cyan-500/10 rounded-br-md'
            : 'bg-white/[0.05] text-gray-300 border border-white/[0.06] rounded-bl-md'
        }`}
      >
        {/* Simple markdown-like rendering */}
        {message.content.split('\n').map((line, i) => {
          if (!line.trim()) return <br key={i} />;

          // Bold
          let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
          // Headers
          if (line.startsWith('### ')) {
            return (
              <h4 key={i} className="text-white font-semibold text-base mt-3 mb-1">
                {line.replace('### ', '')}
              </h4>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h3 key={i} className="text-white font-bold text-lg mt-3 mb-1">
                {line.replace('## ', '')}
              </h3>
            );
          }
          // Bullet points
          if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
            return (
              <div key={i} className="flex gap-2 ml-2 my-0.5">
                <span className="text-cyan-400 mt-0.5">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatted.replace(/^[\s]*[-•]\s*/, '') }} />
              </div>
            );
          }
          // Regular text
          return <p key={i} className="my-0.5" dangerouslySetInnerHTML={{ __html: formatted }} />;
        })}
      </div>
    </motion.div>
  );
}

// Typing indicator
export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-500 to-emerald-500">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white/[0.05] border border-white/[0.06] rounded-2xl rounded-bl-md px-5 py-4">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-cyan-400"
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default ChatBubble;
