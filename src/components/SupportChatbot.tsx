"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, ChevronDown } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuickReply {
  label: string;
  message: string;
}

const QUICK_REPLIES: QuickReply[] = [
  { label: "🚀 How does OfferIQ work?", message: "How does OfferIQ work?" },
  {
    label: "💳 What plans are available?",
    message: "What plans and pricing does OfferIQ offer?",
  },
  {
    label: "🔗 Can I use my own domain?",
    message: "Can I connect my own domain to OfferIQ?",
  },
  {
    label: "⏱️ How long does setup take?",
    message: "How long does it take to build a complete funnel?",
  },
];

const GREETING =
  "Hi! I'm the OfferIQ assistant 👋 I can answer questions about features, plans, setup, and more. What would you like to know?";

// ─── Tiny markdown renderer (bold + bullets — no extra deps) ──────────────────

function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    const isBullet = /^[\-\*•]\s/.test(line.trim());
    const content = isBullet ? line.trim().replace(/^[\-\*•]\s+/, "") : line;

    // Bold (**text**)
    const inlineNodes: React.ReactNode[] = [];
    const boldRegex = /\*\*(.*?)\*\*/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = boldRegex.exec(content)) !== null) {
      if (m.index > last) inlineNodes.push(content.slice(last, m.index));
      inlineNodes.push(
        <strong key={m.index} className="font-semibold text-white">
          {m[1]}
        </strong>,
      );
      last = boldRegex.lastIndex;
    }
    if (last < content.length) inlineNodes.push(content.slice(last));

    if (isBullet) {
      nodes.push(
        <li
          key={i}
          className="ml-4 list-disc text-white/80 leading-relaxed text-[13px]"
        >
          {inlineNodes}
        </li>,
      );
    } else if (content.trim()) {
      nodes.push(
        <p
          key={i}
          className="text-white/85 leading-relaxed text-[13px] mb-1.5 last:mb-0"
        >
          {inlineNodes}
        </p>,
      );
    }
  });

  return nodes;
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-white/40"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SupportChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [hasOpened, setHasOpened] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/support-chat" }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isOpen]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasOpened(true);
  };

  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text || isLoading) return;
    setInputValue("");
    setShowQuickReplies(false);
    sendMessage({ role: "user", parts: [{ type: "text", text }] });
  }, [inputValue, isLoading, sendMessage]);

  const handleQuickReply = useCallback(
    (msg: string) => {
      if (isLoading) return;
      setShowQuickReplies(false);
      sendMessage({ role: "user", parts: [{ type: "text", text: msg }] });
    },
    [isLoading, sendMessage],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Determine if we have any real user messages (to conditionally show quick replies)
  const hasUserMessages = messages.some((m) => m.role === "user");

  return (
    <>
      {/* ── Chat Panel ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-6 z-[9998] w-[360px] max-w-[calc(100vw-24px)] flex flex-col"
            style={{
              borderRadius: "20px",
              background: "rgba(8, 10, 20, 0.97)",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow:
                "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              maxHeight: "min(520px, calc(100vh - 120px))",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3.5"
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "20px 20px 0 0",
                background:
                  "linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(59,130,246,0.08) 100%)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)",
                    boxShadow: "0 0 16px rgba(139,92,246,0.4)",
                  }}
                >
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white leading-tight">
                    OfferIQ Assistant
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] text-white/40">
                      Online · Replies instantly
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Close chat"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-3 py-3 space-y-3"
              style={{ minHeight: 0 }}
            >
              {/* Greeting bubble (always shown) */}
              <div className="flex items-start gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background:
                      "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)",
                  }}
                >
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <div
                  className="rounded-2xl rounded-tl-sm px-3 py-2.5 max-w-[85%]"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <p className="text-[13px] text-white/85 leading-relaxed">
                    {GREETING}
                  </p>
                </div>
              </div>

              {/* Quick reply chips (before any messages sent) */}
              {!hasUserMessages && showQuickReplies && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap gap-2 pl-8"
                >
                  {QUICK_REPLIES.map((qr) => (
                    <button
                      key={qr.message}
                      onClick={() => handleQuickReply(qr.message)}
                      disabled={isLoading}
                      className="text-[12px] text-white/70 hover:text-white px-2.5 py-1.5 rounded-full transition-all hover:bg-white/10 disabled:opacity-40"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.10)",
                      }}
                    >
                      {qr.label}
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Conversation messages */}
              {messages.map((msg) => {
                const isUser = msg.role === "user";

                // Extract text content from parts (AI SDK v3 UIMessage uses parts, not .content)
                let textContent = "";
                if (msg.parts && Array.isArray(msg.parts)) {
                  textContent = (msg.parts as any[])
                    .filter((p: any) => p?.type === "text")
                    .map((p: any) => String(p.text ?? ""))
                    .join("");
                }

                if (!textContent) return null;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : ""}`}
                  >
                    {!isUser && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          background:
                            "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)",
                        }}
                      >
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-3 py-2.5 max-w-[85%] ${
                        isUser ? "rounded-tr-sm" : "rounded-tl-sm"
                      }`}
                      style={
                        isUser
                          ? {
                              background:
                                "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
                              boxShadow: "0 4px 12px rgba(139,92,246,0.25)",
                            }
                          : {
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(255,255,255,0.08)",
                            }
                      }
                    >
                      {isUser ? (
                        <p className="text-[13px] text-white leading-relaxed">
                          {textContent}
                        </p>
                      ) : (
                        <div>{renderMarkdown(textContent)}</div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-start gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background:
                        "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)",
                    }}
                  >
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <div
                    className="rounded-2xl rounded-tl-sm"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <TypingDots />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div
              className="px-3 py-3"
              style={{
                borderTop: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "0 0 20px 20px",
              }}
            >
              <div
                className="flex items-end gap-2 rounded-xl px-3 py-2.5"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about OfferIQ…"
                  rows={1}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-[13px] text-white placeholder-white/30 resize-none outline-none leading-relaxed disabled:opacity-50"
                  style={{ maxHeight: "96px", overflowY: "auto" }}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30"
                  style={{
                    background:
                      inputValue.trim() && !isLoading
                        ? "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)"
                        : "rgba(255,255,255,0.08)",
                  }}
                  aria-label="Send message"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
              <p className="text-center text-[10px] text-white/20 mt-2">
                Powered by OfferIQ AI · Not a substitute for support email
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Trigger Button ───────────────────────────────────────── */}
      <motion.button
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
        style={{
          background: isOpen
            ? "rgba(20, 20, 35, 0.95)"
            : "linear-gradient(135deg, #8B5CF6 0%, #6366F1 60%, #3B82F6 100%)",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: isOpen
            ? "0 8px 32px rgba(0,0,0,0.5)"
            : "0 8px 32px rgba(139,92,246,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset",
        }}
        aria-label={isOpen ? "Close support chat" : "Open support chat"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-5 h-5 text-white/70" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="w-5 h-5 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread dot — shown before first open */}
        {!hasOpened && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#030712]"
          />
        )}
      </motion.button>
    </>
  );
}
