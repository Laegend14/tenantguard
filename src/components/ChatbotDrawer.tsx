'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  ShieldAlert, 
  Scale, 
  Info, 
  CornerDownLeft, 
  Bot, 
  User,
  History,
  Database,
  Trash2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { logAiChat, saveLocalHistory } from '@/lib/firebase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

const QUICK_PROMPTS = [
  'My landlord gave me a 5-day notice to pay rent. Is that legal in NYC?',
  'It has been 20 days since I moved out and no deposit return. What are my rights?',
  'Can my landlord charge me a $100 late fee in New York?',
  'Can a landlord lock me out without going to court in New York City?'
];

export function ChatbotDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your TenantGuard NYC Housing Assistant. Ask me anything regarding NYC tenant protections, the 2019 HSTPA, 14-day notice requirements, or security deposit recovery.',
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, isOpen, activeTab]);

  // Load chat history when switching to history tab or on mount
  const fetchChatHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/history?type=ai_chat');
      const data = await res.json();
      if (data.history) {
        setChatHistory(data.history);
      }
    } catch (err) {
      console.warn('Could not load chat history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchChatHistory();
    }
  }, [isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text,
          history: messages.slice(-4)
        })
      });

      const data = await res.json();
      const replyContent = data.reply || data.error || 'Unable to process query at this time.';
      const botReply: Message = {
        role: 'assistant',
        content: replyContent,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botReply]);

      // Log to Firebase & local history
      logAiChat(text, replyContent, data.model || 'Llama-3.3-70B');
      
      // Refresh history list in background
      setTimeout(fetchChatHistory, 500);

    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Connection error. Under NY RPAPL § 711, remember that 14 days written demand is mandatory for non-payment.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadPastChat = (item: any) => {
    const q = item.metadata?.question || item.summary;
    const a = item.metadata?.reply;
    if (q && a) {
      setMessages([
        {
          role: 'assistant',
          content: 'Here is the historical query retrieved from your Firebase Legal Vault:',
          time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          role: 'user',
          content: q,
          time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          role: 'assistant',
          content: a,
          time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setActiveTab('chat');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md h-full bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-main)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[var(--primary-purple)] flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                TenantGuard AI Legal Assistant
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                <span>Live • Hugging Face Llama 3.3 70B</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] transition-colors"
            aria-label="Close Assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector & Firebase Sync Indicator */}
        <div className="px-4 py-2 bg-[var(--bg-surface-elevated)] border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-1 bg-[var(--bg-main)] p-0.5 rounded-lg border border-[var(--border-subtle)]">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'bg-[var(--primary-purple)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Live Chat
            </button>
            <button
              onClick={() => {
                setActiveTab('history');
                fetchChatHistory();
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-[var(--primary-purple)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <History className="w-3 h-3" />
              <span>History ({chatHistory.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
            <Database className="w-3 h-3" />
            <span>Firebase Synced</span>
          </div>
        </div>

        {/* Informational Disclaimer Banner */}
        <div className="px-4 py-1.5 bg-[var(--badge-bg)] border-b border-[var(--border-subtle)] flex items-start gap-1.5 text-[10px] text-[var(--badge-text)]">
          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>Informational self-help assistant grounded in NY HSTPA & Housing Maintenance Code.</span>
        </div>

        {/* TAB 1: LIVE CHAT */}
        {activeTab === 'chat' ? (
          <>
            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-[var(--primary-purple-light)] text-[var(--primary-purple)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[var(--primary-purple)] text-white rounded-tr-none'
                        : 'bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <div className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-purple-200' : 'text-[var(--text-muted)]'}`}>
                      {msg.time}
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-[var(--primary-purple)] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] italic pl-9">
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-[var(--primary-purple)]" />
                  <span>Querying Hugging Face Llama 3.3 statutory engine...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-main)]/50">
              <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                Suggested NYC Housing Questions:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    disabled={loading}
                    className="text-[11px] text-left px-2.5 py-1 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)] transition-colors truncate max-w-full"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
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
                  placeholder="Ask about 14-day notice, deposit forfeiture, or late fees..."
                  disabled={loading}
                  className="flex-1 bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-full px-4 py-2 text-xs sm:text-sm focus:outline-none focus:border-[var(--border-focus)] transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="btn-pill-primary px-3.5 py-2 text-xs"
                  aria-label="Send Message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          /* TAB 2: FIREBASE CHAT HISTORY */
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <span className="text-xs font-bold text-[var(--text-primary)]">
                Logged Firebase Legal Queries
              </span>
              <button
                onClick={fetchChatHistory}
                className="text-[11px] text-[var(--primary-purple)] hover:underline"
              >
                Refresh
              </button>
            </div>

            {historyLoading ? (
              <div className="text-center py-8 text-xs text-[var(--text-muted)]">
                <Sparkles className="w-4 h-4 animate-spin mx-auto mb-2 text-[var(--primary-purple)]" />
                Loading Firebase activity history...
              </div>
            ) : chatHistory.length === 0 ? (
              <div className="text-center py-8 text-xs text-[var(--text-muted)]">
                No past chat history recorded yet. Questions you ask will be saved here in Firebase automatically.
              </div>
            ) : (
              chatHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => loadPastChat(item)}
                  className="p-3 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--primary-purple)] transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] mb-1">
                    <span className="font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="font-mono text-purple-600 dark:text-purple-400">
                      {item.metadata?.model?.split('/')[1] || 'Llama-3.3-70B'}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary-purple)] transition-colors line-clamp-2">
                    {item.metadata?.question || item.summary}
                  </p>

                  {item.metadata?.reply && (
                    <p className="text-[11px] text-[var(--text-secondary)] mt-1.5 line-clamp-2 bg-[var(--bg-main)] p-2 rounded-lg border border-[var(--border-subtle)]">
                      {item.metadata.reply}
                    </p>
                  )}

                  <div className="mt-2 flex items-center justify-end text-[10px] font-medium text-[var(--primary-purple)] group-hover:translate-x-1 transition-transform">
                    <span>Reopen in Chat</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}
