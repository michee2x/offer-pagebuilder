'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Bot, Send, User, X, Loader2, Brain, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { EmailCopy, FunnelEmailSequence, FunnelPageKey } from '@/lib/offer-types';
import { toast } from 'sonner';

interface OfferIQAgentProps {
  ability: 'email-sequence';
  funnelId: string;
  funnelName: string;
  // Context details
  activeEmail: EmailCopy | null;
  activePage: FunnelPageKey | null;
  activeEmailIndex: number;
  emailSequence: FunnelEmailSequence;
  // State modifications (Skills Algorithms)
  onUpdateEmail?: (updated: EmailCopy) => void;
  onAddEmail?: (newEmail: EmailCopy) => void;
  onDeleteActiveEmail?: () => void;
}

const TRYOUT_RECOMMENDATIONS = {
  'email-sequence': [
    '✍️ Persuade active email tone',
    '📧 Add a follow-up nurture email',
    '🔍 Check spam words & objections',
  ],
};

function parseMessageText(text: string) {
  if (!text) return null;
  
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    let content = line;
    
    // Check if bullet list
    const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ') || line.trim().startsWith('• ');
    if (isBullet) {
      content = line.trim().replace(/^[-*•]\s+/, '');
    }
    
    // Simple bold (**bold**) and inline code (`code`)
    const parts: React.ReactNode[] = [];
    let currentText = content;
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    let match;
    let lastIndex = 0;
    
    while ((match = regex.exec(currentText)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        parts.push(currentText.substring(lastIndex, matchIndex));
      }
      
      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <strong key={matchIndex} className="font-bold text-white">
            {token.substring(2, token.length - 2)}
          </strong>
        );
      } else if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code key={matchIndex} className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px] text-pink-400">
            {token.substring(1, token.length - 1)}
          </code>
        );
      }
      
      lastIndex = regex.lastIndex;
    }
    
    if (lastIndex < currentText.length) {
      parts.push(currentText.substring(lastIndex));
    }
    
    if (isBullet) {
      return (
        <li key={idx} className="ml-4 list-disc text-white/90 mt-1 leading-relaxed text-xs">
          {parts.length > 0 ? parts : content}
        </li>
      );
    }
    
    return (
      <p key={idx} className="mb-2 leading-relaxed text-xs text-white/85 last:mb-0">
        {parts.length > 0 ? parts : content}
      </p>
    );
  });
}

export function OfferIQAgent({
  ability,
  funnelId,
  funnelName,
  activeEmail,
  activePage,
  activeEmailIndex,
  emailSequence,
  onUpdateEmail,
  onAddEmail,
  onDeleteActiveEmail,
}: OfferIQAgentProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const isDraggingRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Set up V3 useChat with custom transport matching project patterns
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/agent-chat',
      prepareSendMessagesRequest: ({ messages, id }) => ({
        body: {
          id,
          messages,
          ability,
          abilityContext: {
            activeEmail,
            activePage,
            activeEmailIndex,
            emailSequence,
            funnelName,
          },
        },
      }),
    }),
    onFinish: ({ message }) => {
      console.log('[OfferIQAgent] onFinish message:', JSON.stringify(message, null, 2));
      const parts = message.parts ?? [];
      
      // Look for completed tool results representing executing skills
      for (const part of parts as any[]) {
        const result = part?.result ?? part?.output;
        if (result?.success) {
          toast.success('Skill executed successfully!');
          const action = result.action;
          const data = result.data;
          
          if (action === 'edit_email' && onUpdateEmail) {
            const updated: EmailCopy = {
              ...activeEmail,
              ...data,
              page: activePage!,
              day: activeEmail?.day ?? 1,
            };
            onUpdateEmail(updated);
          } else if (action === 'add_email' && onAddEmail) {
            const newEmail: EmailCopy = {
              ...data,
              page: activePage!,
            };
            onAddEmail(newEmail);
          } else if (action === 'delete_email' && onDeleteActiveEmail) {
            onDeleteActiveEmail();
          }
        }
      }
    },
    onError: (err) => {
      toast.error(err.message || 'Chat error');
    },
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  const tryouts = TRYOUT_RECOMMENDATIONS[ability] || [];

  // Load chat history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`offeriq_agent_history_${funnelId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch (e) {
        // ignore
      }
    }
  }, [funnelId, setMessages]);

  // Persist messages to localStorage when updated
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`offeriq_agent_history_${funnelId}`, JSON.stringify(messages));
    }
  }, [messages, funnelId]);

  const handleClearHistory = () => {
    if (messages.length === 0) return;
    setMessages([]);
    localStorage.removeItem(`offeriq_agent_history_${funnelId}`);
    toast.success('Chat history cleared!');
  };

  const handleTryoutClick = (text: string) => {
    if (isLoading) return;
    sendMessage({ role: 'user', parts: [{ type: 'text', text: text }] });
  };

  const handleBallTap = () => {
    if (isDraggingRef.current) return;
    setIsPanelOpen(!isPanelOpen);
  };

  // Auto-scroll chat area on new message or stream
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isPanelOpen]);

  return (
    <>
      {/* Floating interactive ball widget */}
      <motion.div
        drag
        dragMomentum={false}
        dragConstraints={{
          left: 20,
          right: typeof window !== 'undefined' ? window.innerWidth - 80 : 800,
          top: 20,
          bottom: typeof window !== 'undefined' ? window.innerHeight - 80 : 800,
        }}
        onDragStart={() => {
          isDraggingRef.current = true;
        }}
        onDragEnd={() => {
          setTimeout(() => {
            isDraggingRef.current = false;
          }, 60);
        }}
        onClick={handleBallTap}
        style={{ touchAction: 'none' }}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center cursor-grab active:cursor-grabbing group"
      >
        {/* Pulsing outer visual glow */}
        <div className="absolute inset-0 rounded-full bg-blue-500/30 blur-md group-hover:scale-110 transition-transform duration-300 animate-pulse" />
        
        {/* Glowing border ring */}
        <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-fuchsia-500 animate-spin-slow opacity-80 group-hover:opacity-100 transition-opacity" />

        {/* Circular ball wrapper */}
        <div className="relative w-14 h-14 rounded-full bg-[#0a0d18] border border-white/10 flex items-center justify-center shadow-[0_4px_24px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Background subtle mesh gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.2)_0%,rgba(140,22,250,0)_70%)]" />
          
          {/* RENDER CUSTOM IMAGE HERE INSTEAD OF ICON IF AVAILABLE */}
          <Sparkles className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] animate-pulse" />
        </div>
      </motion.div>

      {/* Slide-out Panel Drawer (No dark background backdrop overlay) */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-[380px] h-screen bg-[#080b14] border-l border-white/10 shadow-[-15px_0_40px_rgba(0,0,0,0.7)] flex flex-col pointer-events-auto"
          >
            {/* Panel Top header */}
            <div className="px-4 py-3 bg-[#0d111e]/90 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Brain className="w-4.5 h-4.5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">OfferIQ Agent</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] font-semibold text-emerald-400 capitalize">
                      {ability.replace('-', ' ')} ability
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {messages.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    title="Clear Chat History"
                    className="h-7 px-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground transition-all duration-300 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Warning Scope Description (Context pill) */}
            <div className="px-4 py-2 bg-[#12182b] border-b border-white/5 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Operating strictly within the <strong>Email Sequence</strong> scope. Cannot build landing pages or adjust layout sections.
              </p>
            </div>

            {/* Tryout Chips container */}
            <div className="px-4 py-3 bg-[#0a0e1c] border-b border-white/5 flex flex-col gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                Ask OfferIQ to try out
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {tryouts.map((t) => (
                  <button
                    key={t}
                    disabled={isLoading}
                    onClick={() => handleTryoutClick(t)}
                    className="px-2.5 py-1.5 rounded-xl border border-white/5 hover:border-cyan-500/40 bg-white/[0.02] hover:bg-cyan-500/5 text-[10px] font-semibold text-slate-300 hover:text-white transition-all text-left shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#06080e] custom-scrollbar scroll-smooth">
              <div className="flex flex-col gap-4">
                {/* Initial welcome message if empty */}
                {messages.length === 0 && (
                  <div className="flex gap-2.5 items-start mt-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="bg-[#0f1425] border border-white/5 rounded-2xl rounded-tl-none px-3.5 py-3 max-w-[85%]">
                      <p className="text-xs font-bold text-white mb-1.5">
                        Hey there! 👋
                      </p>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        I am your dedicated OfferIQ agent operating under the <strong>Email Sequence Ability</strong>. I can edit this email copy, draft follow-ups, optimize tone, or run readability analysis.
                      </p>
                      <p className="text-[10px] text-slate-400 mt-2 font-medium">
                        Click any of the suggestions above or type your request below to begin.
                      </p>
                    </div>
                  </div>
                )}

                {/* Message items */}
                {messages.map((m) => {
                  const isUser = m.role === 'user';
                  const textContent = (m.parts && m.parts.length > 0)
                    ? m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('')
                    : (m as any).content || (m as any).text || '';

                  // Extract tool invocations from either m.toolInvocations or m.parts
                  const invocations = m.toolInvocations && m.toolInvocations.length > 0 
                    ? m.toolInvocations 
                    : (m.parts ?? [])
                        .filter((p: any) => p.type === 'tool-invocation' || p.type === 'tool-result' || p.type === 'tool-call' || (typeof p.type === 'string' && p.type.startsWith('tool-')))
                        .map((p: any) => {
                          const base = p.toolInvocation ?? p;
                          // Handle new AI SDK 3.0.x format where type is 'tool-<name>'
                          if (p.type?.startsWith('tool-') && !base.toolName) {
                            base.toolName = p.type.replace('tool-', '');
                            base.args = base.args ?? p.input;
                            base.result = base.result ?? p.output;
                            base.state = base.state ?? p.state;
                          }
                          return base;
                        })
                        .filter(Boolean);

                  return (
                    <div
                      key={m.id}
                      className={cn("flex gap-2.5 items-start w-full", isUser ? "justify-end" : "justify-start")}
                    >
                      {!isUser && (
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-4 h-4 text-cyan-400" />
                        </div>
                      )}

                      <div
                        className={cn(
                          "rounded-2xl px-3.5 py-2.5 max-w-[85%] text-xs flex flex-col gap-1 shadow-sm",
                          isUser
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none border-0"
                            : "bg-[#0f1425] border border-white/5 text-slate-200 rounded-tl-none"
                        )}
                      >
                        {parseMessageText(textContent || (m as any).content || '')}

                        {/* Rendering skills invocations feedback */}
                        {invocations.map((invocator: any, i) => {
                          const toolName = invocator.toolName ?? invocator.toolCall?.name;
                          const actionLabel = 
                            toolName === 'edit_email_content' ? 'editing email copy' :
                            toolName === 'add_new_email' ? 'adding follow-up email' :
                            toolName === 'delete_active_email' ? 'deleting email' :
                            'analyzing content';

                          const toolResult = invocator.result ?? invocator.output ?? invocator.toolInvocation?.result;
                          const toolArgs = invocator.args ?? invocator.toolInvocation?.args;
                          const isCompleted = !!toolResult || invocator.state === 'result' || invocator.state === 'output-available';
                          
                          // Use toolArgs as fallback if toolResult is empty (happens during stream or maxSteps=1 disconnect)
                          const rawData = toolResult?.data ?? toolResult ?? toolArgs;

                          // Extract target data mapping with safety fallback values
                          const isSuggestEmail = rawData?.action === 'suggest_email' || !!rawData?.analysis;
                          const suggestData = rawData?.action === 'suggest_email' ? rawData.data : rawData;

                          const isEditEmail = rawData?.action === 'edit_email' || (!!rawData?.subject && !rawData?.suggestions);
                          const editData = rawData?.action === 'edit_email' ? rawData.data : rawData;

                          const isAddEmail = rawData?.action === 'add_email' || (!!rawData?.day && !!rawData?.subject);
                          const addData = rawData?.action === 'add_email' ? rawData.data : rawData;

                          return (
                            <div key={i} className="mt-2">
                              {/* Status block */}
                              <div className={cn(
                                "flex items-center gap-1.5 text-[10px] font-semibold",
                                isUser ? "text-white/70" : "text-cyan-400/80"
                              )}>
                                {!isCompleted ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                                    <span>Applying skill ({actionLabel})…</span>
                                  </>
                                ) : (
                                  <>
                                    <span>✓ Skill applied ({actionLabel})</span>
                                  </>
                                )}
                              </div>

                              {/* Rich rendering of tool execution outputs */}
                              {(isCompleted || !!rawData) && (
                                <div className="mt-2">
                                  {isSuggestEmail && suggestData && (
                                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-2.5">
                                      <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Copy audit & Objections</span>
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[10px] text-slate-400">Tone Score:</span>
                                          <span className={cn(
                                            "px-1.5 py-0.5 rounded text-[10px] font-black",
                                            (suggestData.toneScore ?? 0) >= 80 ? "bg-emerald-500/20 text-emerald-400" :
                                            (suggestData.toneScore ?? 0) >= 60 ? "bg-amber-500/20 text-amber-400" :
                                            "bg-rose-500/20 text-rose-400"
                                          )}>
                                            {suggestData.toneScore ?? 0}/100
                                          </span>
                                        </div>
                                      </div>
                                      
                                      <p className="text-[11px] text-slate-300 leading-relaxed">
                                        {suggestData.analysis}
                                      </p>

                                      {suggestData.suggestions && suggestData.suggestions.length > 0 && (
                                        <div className="space-y-1.5 pt-1">
                                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Actionable Suggestions:</span>
                                          <ul className="space-y-1">
                                            {suggestData.suggestions.map((suggestion: string, idx: number) => (
                                              <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5 leading-relaxed">
                                                <span className="text-cyan-400 shrink-0 mt-0.5">✦</span>
                                                <span>{suggestion}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {isEditEmail && editData && (
                                    <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 space-y-1">
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">Email Copy Tweaked</span>
                                      <div className="text-[10px] text-slate-300 space-y-0.5">
                                        <p><strong>Subject:</strong> {editData.subject}</p>
                                        <p><strong>Preview:</strong> {editData.preview}</p>
                                      </div>
                                    </div>
                                  )}

                                  {isAddEmail && addData && (
                                    <div className="p-2.5 rounded-lg bg-indigo-500/5 border border-indigo-500/10 space-y-1">
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400">New Email Added (Day {addData.day})</span>
                                      <div className="text-[10px] text-slate-300 space-y-0.5">
                                        <p><strong>Subject:</strong> {addData.subject}</p>
                                        <p><strong>Preview:</strong> {addData.preview}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {/* Fallback for empty bubble debug */}
                        {!textContent && invocations.length === 0 && (
                          <div className="text-[10px] text-cyan-400 overflow-x-auto whitespace-pre-wrap max-w-full p-2 bg-black/20 rounded">
                            NO TEXT OR INVOCATIONS DETECTED. RAW:
                            {JSON.stringify(m, null, 2)}
                          </div>
                        )}
                      </div>

                      {isUser && (
                        <div className="w-8 h-8 rounded-lg bg-[#1a2138] border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-4 h-4 text-slate-300" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Loading state indicator */}
                {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                  <div className="flex gap-2.5 items-start">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="bg-[#0f1425] border border-white/5 px-4 py-3 rounded-2xl rounded-tl-none flex items-center space-x-1.5 shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce delay-75" />
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce delay-150" />
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            </div>

            {/* Input area */}
            <div className="p-4 bg-[#0d111e]/90 border-t border-white/10 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!inputValue.trim() || isLoading) return;
                  sendMessage({ role: 'user', parts: [{ type: 'text', text: inputValue.trim() }] });
                  setInputValue('');
                }}
                className="flex items-center space-x-2 bg-[#06080e] border border-white/10 focus-within:border-cyan-500/40 rounded-xl px-3 py-1.5 transition-all"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="e.g. rewrite subject line to be emotional"
                  className="flex-1 bg-transparent border-0 text-slate-200 outline-none text-xs placeholder:text-slate-500 focus:ring-0 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (!inputValue.trim() || isLoading) return;
                      sendMessage({ role: 'user', parts: [{ type: 'text', text: inputValue.trim() }] });
                      setInputValue('');
                    }
                  }}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shrink-0 cursor-pointer shadow-sm border-0"
                  disabled={isLoading || !inputValue.trim()}
                >
                  {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
