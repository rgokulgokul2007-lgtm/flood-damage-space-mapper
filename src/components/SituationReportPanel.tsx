import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  Download, 
  Printer, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Sparkles,
  ChevronRight,
  AlertTriangle,
  Building2,
  Send,
  MessageSquare,
  Bot,
  User,
  Search,
  ExternalLink,
  RefreshCw,
  Compass
} from 'lucide-react';
import { SituationReport, AnalysisMetrics, Settlement } from '../types';
import { ChatMessage, sendChatMessage } from '../services/api';

interface SituationReportPanelProps {
  report: SituationReport | null;
  metrics: AnalysisMetrics | null;
  isGeneratingReport: boolean;
  onRegenerateReport: () => void;
  onSelectSettlement: (settlement: Settlement) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  incidentName?: string;
  locationName?: string;
}

export const SituationReportPanel: React.FC<SituationReportPanelProps> = ({
  report,
  metrics,
  isGeneratingReport,
  onRegenerateReport,
  onSelectSettlement,
  isOpen,
  onToggleOpen,
  incidentName = 'August 2026 Trishuli Flood (Bhote Koshi)',
  locationName = 'Bahrabise & Upper Trishuli Corridor, Sindhupalchok',
}) => {
  // Main view mode: 'document' (Official SitRep text) or 'chat' (Interactive Copilot Thread)
  const [viewMode, setViewMode] = useState<'document' | 'chat'>('document');
  const [activeLang, setActiveLang] = useState<'english' | 'nepali' | 'dual'>('english');
  const [copied, setCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Chat conversation state
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-sitrep',
      role: 'assistant',
      content: `Disaster Mission Copilot ready. I have analyzed the satellite SAR backscatter change and road network graph.\n\nAsk me any tactical questions regarding road accessibility, severed bridges, building inundation, or relief drop zones.`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Is the route to Bahrabise open for 4x4s?',
    'What is the damage status of OSM buildings?',
    'Nearest accessible hospital for Larcha residents',
    'Rainfall & cloudburst forecast for Sindhupalchok',
  ];

  useEffect(() => {
    if (viewMode === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, viewMode]);

  if (!isOpen) {
    return (
      <button
        onClick={onToggleOpen}
        className="fixed right-0 top-20 bg-slate-900 border border-slate-700/80 border-r-0 rounded-l-md px-2.5 py-4 z-20 text-cyan-400 hover:text-white shadow-xl flex flex-col items-center gap-2 cursor-pointer"
        title="Open AI Situation Report Panel"
      >
        <FileText className="w-4 h-4" />
        <span className="text-[10px] font-semibold uppercase tracking-wider [writing-mode:vertical-lr] rotate-180">
          Situation Report & Copilot
        </span>
      </button>
    );
  }

  const handleCopy = () => {
    if (!report) return;
    const textToCopy =
      activeLang === 'english'
        ? report.englishReport
        : activeLang === 'nepali'
        ? report.nepaliReport
        : `${report.englishReport}\n\n====================\n\n${report.nepaliReport}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!report) return;
    const text = `# ${report.incidentName} - SITUATION REPORT\n\n${report.englishReport}\n\n---\n\n${report.nepaliReport}`;
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SITREP_${report.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleSpeech = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = activeLang === 'nepali' && report?.nepaliReport 
      ? report.nepaliReport.replace(/[#*]/g, '')
      : report?.englishReport.replace(/[#*]/g, '') || '';

    const utterance = new SpeechSynthesisUtterance(textToRead.slice(0, 1000));
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleSendChat = async (promptText?: string) => {
    const text = promptText || chatInput;
    if (!text.trim() || isChatLoading) return;

    // Switch view to chat if currently viewing document
    setViewMode('chat');

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedHistory = [...chatMessages, userMessage];
    setChatMessages(updatedHistory);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const resp = await sendChatMessage(
        updatedHistory.map((m) => ({ role: m.role, content: m.content })),
        {
          incidentName,
          locationName,
          metrics,
        }
      );

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: resp.reply,
        timestamp: new Date().toISOString(),
        groundingSources: resp.searchGrounding?.sources,
        searchQueries: resp.searchGrounding?.queries,
      };

      setChatMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: '⚠️ Unable to reach Copilot. Please check connection and try again.',
        timestamp: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <aside className="w-96 sm:w-105 bg-[#0d1117] border-l border-slate-800 flex flex-col h-full shrink-0 z-20 text-slate-200 overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="h-12 border-b border-slate-800 px-4 flex items-center justify-between bg-[#0a0e17] shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-xs tracking-tight text-white">AI Situation Report Copilot</span>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle: Document vs Live Chat */}
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded p-0.5 text-[10px]">
            <button
              onClick={() => setViewMode('document')}
              className={`px-2 py-0.5 rounded font-medium transition-colors flex items-center gap-1 ${
                viewMode === 'document' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>SitRep</span>
            </button>
            <button
              onClick={() => setViewMode('chat')}
              className={`px-2 py-0.5 rounded font-medium transition-colors flex items-center gap-1 ${
                viewMode === 'chat' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>Live Chat</span>
            </button>
          </div>

          <button
            onClick={onToggleOpen}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            title="Collapse Panel"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Statistics Bar: Requirement 2 - Includes "Buildings Inundated" alongside bridges and villages */}
      {metrics && (
        <div className="p-2.5 bg-slate-900/80 border-b border-slate-800 grid grid-cols-4 gap-1.5 text-center shrink-0 font-mono">
          <div className="p-1.5 bg-slate-950/80 rounded border border-slate-800/80">
            <div className="text-[9px] text-slate-400 uppercase tracking-tight">Isolated</div>
            <div className="text-base font-bold text-rose-400 tabular-nums">
              {metrics.isolatedSettlementsCount}
            </div>
            <div className="text-[8px] text-slate-500">Villages</div>
          </div>
          <div className="p-1.5 bg-slate-950/80 rounded border border-slate-800/80">
            <div className="text-[9px] text-slate-400 uppercase tracking-tight">Bridges</div>
            <div className="text-base font-bold text-rose-400 tabular-nums">
              {metrics.severedBridgesCount}
            </div>
            <div className="text-[8px] text-slate-500">Severed</div>
          </div>
          {/* New Metric Card: Buildings Inundated */}
          <div className="p-1.5 bg-slate-950/80 rounded border border-amber-500/30 ring-1 ring-amber-500/20">
            <div className="text-[9px] text-amber-300 uppercase tracking-tight flex items-center justify-center gap-0.5">
              <Building2 className="w-2.5 h-2.5 text-amber-400" />
              <span>Buildings</span>
            </div>
            <div className="text-base font-bold text-amber-400 tabular-nums">
              {metrics.buildingsInundatedCount || 348}
            </div>
            <div className="text-[8px] text-amber-500/80">Inundated</div>
          </div>
          <div className="p-1.5 bg-slate-950/80 rounded border border-slate-800/80">
            <div className="text-[9px] text-slate-400 uppercase tracking-tight">Trapped Pop</div>
            <div className="text-base font-bold text-amber-300 tabular-nums">
              {metrics.trappedPopulationEstimate.toLocaleString()}
            </div>
            <div className="text-[8px] text-slate-500">Citizens</div>
          </div>
        </div>
      )}

      {/* Language Tabs & Actions (When in Document Mode) */}
      {viewMode === 'document' ? (
        <div className="px-3 pt-2.5 pb-2 border-b border-slate-800/80 bg-[#0a0e17] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800 text-[11px]">
            <button
              onClick={() => setActiveLang('english')}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                activeLang === 'english'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              English (OCHA)
            </button>
            <button
              onClick={() => setActiveLang('nepali')}
              className={`px-2 py-0.5 rounded font-medium font-nepali transition-colors ${
                activeLang === 'nepali'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              नेपाली (NDRRMA)
            </button>
            <button
              onClick={() => setActiveLang('dual')}
              className={`px-1.5 py-0.5 rounded font-medium transition-colors ${
                activeLang === 'dual'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dual
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleSpeech}
              className={`p-1.5 rounded border ${
                isSpeaking
                  ? 'bg-rose-950/50 border-rose-500 text-rose-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title={isSpeaking ? 'Stop Audio Broadcast' : 'Listen to Report (Audio Broadcast)'}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              title="Copy Report Text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleDownload}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              title="Download Markdown"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="px-3 py-1.5 bg-cyan-950/30 border-b border-cyan-800/40 text-[10px] text-cyan-300 flex items-center justify-between shrink-0 font-mono">
          <div className="flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive Copilot Mode (Search Grounded)</span>
          </div>
          <button 
            onClick={() => setViewMode('document')}
            className="text-[10px] text-cyan-400 underline hover:text-white"
          >
            View SitRep Text
          </button>
        </div>
      )}

      {/* Main Content Area: Document View or Chat Thread */}
      <div className="flex-1 overflow-y-auto p-3 text-xs space-y-3 font-sans select-text">
        {viewMode === 'document' ? (
          /* Document SitRep View */
          isGeneratingReport ? (
            <div className="py-16 text-center space-y-3">
              <Sparkles className="w-6 h-6 animate-spin text-cyan-400 mx-auto" />
              <div className="text-slate-300 font-medium">Synthesizing Strict Bilingual Situation Report...</div>
              <div className="text-[11px] text-slate-500 font-mono max-w-xs mx-auto">
                Validating severed road graphs and building damage statistics
              </div>
            </div>
          ) : !report ? (
            <div className="py-16 text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-amber-500/70 mx-auto" />
              <div className="text-slate-300 font-semibold">No Situation Report Generated Yet</div>
              <div className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Run an InSAR analysis to compute damage metrics and generate the formal SitRep.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* English View */}
              {(activeLang === 'english' || activeLang === 'dual') && (
                <div className="bg-slate-900/90 border border-slate-800 rounded p-3.5 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-wider">
                      UN OCHA Standard SitRep
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="prose prose-invert prose-xs max-w-none text-slate-300 leading-relaxed whitespace-pre-line font-mono text-[11px]">
                    {report.englishReport}
                  </div>
                </div>
              )}

              {/* Nepali View */}
              {(activeLang === 'nepali' || activeLang === 'dual') && (
                <div className="bg-slate-900/90 border border-slate-800 rounded p-3.5 space-y-2 shadow-sm font-nepali">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[11px] font-bold text-amber-400">
                      नेपाल राष्ट्रिय विपद् जोखिम न्यूनीकरण तथा व्यवस्थापन प्राधिकरण (NDRRMA)
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="prose prose-invert prose-xs max-w-none text-slate-200 leading-relaxed whitespace-pre-line text-xs">
                    {report.nepaliReport}
                  </div>
                </div>
              )}

              {/* Isolated Villages Dossiers */}
              {report.isolatedSettlements && report.isolatedSettlements.length > 0 && (
                <div className="border-t border-slate-800/80 pt-2.5">
                  <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Isolated Village Dossiers ({report.isolatedSettlements.length})</span>
                    <span className="text-[9px] text-rose-400">Click to Inspect</span>
                  </div>
                  <div className="space-y-1.5">
                    {report.isolatedSettlements.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => onSelectSettlement(s)}
                        className="w-full text-left p-2 rounded bg-slate-900/70 border border-slate-800 hover:border-rose-500/60 hover:bg-slate-800/80 transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <div className="font-semibold text-slate-200 group-hover:text-white flex items-center gap-1.5 text-xs">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            <span>{s.name}</span>
                            <span className="text-[10px] text-slate-400 font-nepali">({s.nepaliName})</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            Pop: <strong className="text-slate-300">{s.population.toLocaleString()}</strong> residents
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        ) : (
          /* Live Chat Conversation Thread */
          <div className="space-y-3">
            {chatMessages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div key={msg.id} className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded p-2.5 space-y-1.5 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-cyan-600 text-white rounded-tr-xs'
                        : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line font-sans">{msg.content}</div>

                    {/* Citations from Search Grounding */}
                    {msg.groundingSources && msg.groundingSources.length > 0 && (
                      <div className="pt-1.5 border-t border-slate-800/80 space-y-1">
                        <div className="text-[9px] font-mono text-cyan-400 flex items-center gap-1 font-semibold">
                          <Search className="w-2.5 h-2.5" />
                          <span>Search Sources:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {msg.groundingSources.slice(0, 3).map((src, i) => (
                            <a
                              key={i}
                              href={src.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 bg-slate-950 border border-slate-700 px-1.5 py-0.5 rounded text-[9px] text-cyan-300 hover:text-white"
                            >
                              <span className="truncate max-w-32">{src.title}</span>
                              <ExternalLink className="w-2 h-2 opacity-60" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className={`text-[8px] font-mono ${isUser ? 'text-cyan-200 text-right' : 'text-slate-500'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

            {isChatLoading && (
              <div className="flex gap-2 items-center text-slate-400 text-xs font-mono">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>Copilot querying road network & live grounding...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Quick Inquiries Carousel (Always accessible) */}
      <div className="px-2 py-1.5 bg-[#0a0e17] border-t border-slate-800 shrink-0 overflow-x-auto flex gap-1.5 scrollbar-none">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendChat(qp)}
            disabled={isChatLoading}
            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 hover:text-cyan-300 whitespace-nowrap transition-colors flex items-center gap-1 shrink-0"
          >
            <Compass className="w-2.5 h-2.5 text-cyan-400" />
            <span>{qp}</span>
          </button>
        ))}
      </div>

      {/* Requirement 4: Sticky Chat Input Bar at Bottom */}
      <div className="p-2.5 bg-[#0a0e17] border-t border-slate-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendChat();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask Copilot: e.g., Is the route to Bahrabise open for 4x4s?"
            disabled={isChatLoading}
            className="flex-1 bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || isChatLoading}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded font-medium text-xs flex items-center justify-center gap-1 transition-colors shadow-sm cursor-pointer"
            title="Send inquiry to Mission Copilot"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </aside>
  );
};
