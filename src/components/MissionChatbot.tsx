import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Search, 
  ExternalLink, 
  Sparkles, 
  User, 
  Compass, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { ChatMessage, sendChatMessage } from '../services/api';

interface MissionChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  incidentContext: any;
}

export const MissionChatbot: React.FC<MissionChatbotProps> = ({
  isOpen,
  onClose,
  incidentContext,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello Field Responder. I am your **Mission Copilot** powered by Gemini with live **Google Search Grounding**.\n\nI can analyze our InSAR flood masks, explain road severance graphs, evaluate cut-off settlement priorities, and fetch real-time weather & river sensor data. How can I assist your operation?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Assess helicopter landing zones for isolated Helambu villages',
    'Latest monsoon rainfall & flood alerts for Sindhupalchok',
    'What caused the bridge washouts along Melamchi river?',
    'Nearest accessible hospital node from Kiul village',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const resp = await sendChatMessage(
        newHistory.map((m) => ({ role: m.role, content: m.content })),
        incidentContext
      );

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: resp.reply,
        timestamp: new Date().toISOString(),
        groundingSources: resp.searchGrounding?.sources,
        searchQueries: resp.searchGrounding?.queries,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Failed to send chat message:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: '⚠️ Failed to connect to Mission Copilot. Please verify network connectivity or re-try your prompt.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end sm:p-6 bg-black/60 backdrop-blur-xs select-none pointer-events-auto">
      <div 
        className="w-full sm:w-115 h-full sm:h-165 bg-[#0d1117] border border-slate-700/80 rounded-none sm:rounded-lg shadow-2xl flex flex-col overflow-hidden text-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="h-13 bg-[#0a0e17] border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-xs text-white flex items-center gap-2">
                <span>Mission Copilot</span>
                <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.2 rounded font-mono">
                  Search Grounded
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {incidentContext?.incidentName || 'Disaster Assessment Mode'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans select-text">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-lg p-3 space-y-2 leading-relaxed ${
                    isUser
                      ? 'bg-cyan-600 text-white rounded-tr-xs'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-xs'
                  }`}
                >
                  <div className="whitespace-pre-line text-xs font-sans">
                    {m.content}
                  </div>

                  {/* Search Grounding Citations */}
                  {m.groundingSources && m.groundingSources.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1">
                      <div className="text-[10px] font-mono text-cyan-400 flex items-center gap-1 font-semibold">
                        <Search className="w-3 h-3" />
                        <span>Google Search Grounding Sources:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {m.groundingSources.slice(0, 4).map((source, idx) => (
                          <a
                            key={idx}
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 bg-slate-950/80 hover:bg-slate-800 border border-slate-700/80 px-2 py-0.5 rounded text-[10px] text-cyan-300 hover:text-cyan-200 transition-colors"
                          >
                            <span className="truncate max-w-40">{source.title}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-70" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={`text-[9px] font-mono ${isUser ? 'text-cyan-200 text-right' : 'text-slate-500'}`}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {isUser && (
                  <div className="w-6 h-6 rounded bg-cyan-700 flex items-center justify-center text-white shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2.5 items-center text-slate-400 text-xs font-mono">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400 shrink-0" />
              <span>Mission Copilot searching live satellite & grounding data...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Carousel */}
        <div className="p-2 bg-[#0a0e17] border-t border-slate-800/80 shrink-0 overflow-x-auto flex gap-1.5 scrollbar-none">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 hover:text-cyan-300 whitespace-nowrap transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <Compass className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>{qp}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[#0a0e17] border-t border-slate-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Copilot (e.g. assess road bypass, live weather)..."
              disabled={isLoading}
              className="flex-1 bg-slate-950 border border-slate-700/80 rounded px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
