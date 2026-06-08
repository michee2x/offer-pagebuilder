"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Send,
  User,
  X,
  Loader2,
  Brain,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { SparkleAura } from "@/components/ui/sparkle-aura";

import { cn } from "@/lib/utils";
import type {
  EmailCopy,
  FunnelEmailSequence,
  FunnelPageKey,
  CopyOutput,
} from "@/lib/offer-types";
import { toast } from "sonner";

interface OfferIQAgentProps {
  ability: "email-sequence" | "copy" | "builder" | "intelligence";
  funnelId: string;
  funnelName: string;
  // Email context (for email-sequence ability)
  activeEmail?: EmailCopy | null;
  activePage?: FunnelPageKey | null;
  activeEmailIndex?: number;
  emailSequence?: FunnelEmailSequence;
  // Copy context (for copy ability)
  copy?: CopyOutput | null;
  activeCopyPage?: FunnelPageKey | null;
  // State modifications (Skills Algorithms)
  onUpdateEmail?: (updated: EmailCopy) => void;
  onAddEmail?: (newEmail: EmailCopy) => void;
  onDeleteActiveEmail?: () => void;
  onUpdateCopyPage?: (page: FunnelPageKey, html: string) => void;
  // Intelligence context
  activeSectionId?: string | null;
  activeSectionContent?: string | null;
  reportData?: { call1: Record<string, string> | null; call2: Record<string, string> | null } | null;
  onUpdateIntelligenceSection?: (sectionId: string, content: string) => void;
  // Builder context
  builderPages?: Record<string, any> | null;
  activeBuilderPagePath?: string | null;
  onUpdateBuilderCode?: (code: string) => void;
  onApplyBuilderState?: (
    components: Record<string, any>,
    rootList: string[],
  ) => void;
}

const TRYOUT_RECOMMENDATIONS = {
  "email-sequence": [
    "Persuade active email tone",
    "Add a follow-up nurture email",
    "Check spam words & objections",
  ],
  copy: [
    "Rewrite the main headline",
    "Make CTA more persuasive",
    "Audit copy for objections",
  ],
  builder: [
    "Refactor hero component to accept dynamic props",
    "Update CTA styles across the page",
    "Convert this section to responsive grid layout",
  ],
  intelligence: [
    "Rewrite this section to sound punchier",
    "Add a dynamic chart visualizing this data",
    "Make this section more digestible",
  ],
};

function parseMessageText(text: string) {
  if (!text) return null;

  const lines = text.split("\n");
  return lines.map((line, idx) => {
    let content = line;

    // Check if bullet list
    const isBullet =
      line.trim().startsWith("- ") ||
      line.trim().startsWith("* ") ||
      line.trim().startsWith("• ");
    if (isBullet) {
      content = line.trim().replace(/^[-*•]\s+/, "");
    }

    // Simple bold (**bold**) and inline code (`code`)
    const parts: React.ReactNode[] = [];
    const currentText = content;
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(currentText)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        parts.push(currentText.substring(lastIndex, matchIndex));
      }

      const token = match[0];
      if (token.startsWith("**") && token.endsWith("**")) {
        parts.push(
          <strong key={matchIndex} className="font-bold text-white">
            {token.substring(2, token.length - 2)}
          </strong>,
        );
      } else if (token.startsWith("`") && token.endsWith("`")) {
        parts.push(
          <code
            key={matchIndex}
            className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px] text-pink-400"
          >
            {token.substring(1, token.length - 1)}
          </code>,
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < currentText.length) {
      parts.push(currentText.substring(lastIndex));
    }

    if (isBullet) {
      return (
        <li
          key={idx}
          className="ml-4 list-disc text-white/90 mt-1 leading-relaxed text-xs"
        >
          {parts.length > 0 ? parts : content}
        </li>
      );
    }

    return (
      <p
        key={idx}
        className="mb-2 leading-relaxed text-xs text-white/85 last:mb-0"
      >
        {parts.length > 0 ? parts : content}
      </p>
    );
  });
}

export function OfferIQAgent({
  ability,
  funnelId,
  funnelName,
  activeEmail = null,
  activePage = null,
  activeEmailIndex = 0,
  emailSequence = {},
  copy = null,
  activeCopyPage = null,
  onUpdateEmail,
  onAddEmail,
  onDeleteActiveEmail,
  onUpdateCopyPage,
  activeSectionId = null,
  activeSectionContent = null,
  reportData = null,
  onUpdateIntelligenceSection,
  builderPages = null,
  activeBuilderPagePath = null,
  onUpdateBuilderCode,
  onApplyBuilderState,
}: OfferIQAgentProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const isDraggingRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Determine context based on ability
  const context =
    ability === "copy"
      ? { copy, activeCopyPage }
      : ability === "builder"
        ? { builderPages, activeBuilderPagePath }
        : ability === "intelligence"
          ? { activeSectionId, activeSectionContent, reportData }
          : { activeEmail, activePage, activeEmailIndex, emailSequence };

  // Create a ref to hold the latest context
  const contextRef = useRef({
    copy, activeCopyPage,
    builderPages, activeBuilderPagePath,
    activeSectionId, activeSectionContent, reportData,
    activeEmail, activePage, activeEmailIndex, emailSequence,
    funnelName, funnelId
  });

  useEffect(() => {
    contextRef.current = {
      copy, activeCopyPage,
      builderPages, activeBuilderPagePath,
      activeSectionId, activeSectionContent, reportData,
      activeEmail, activePage, activeEmailIndex, emailSequence,
      funnelName, funnelId
    };
  }, [
    copy, activeCopyPage,
    builderPages, activeBuilderPagePath,
    activeSectionId, activeSectionContent, reportData,
    activeEmail, activePage, activeEmailIndex, emailSequence,
    funnelName, funnelId
  ]);

  // Set up V3 useChat with custom transport matching project patterns
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/agent-chat",
      prepareSendMessagesRequest: ({ messages, id }) => ({
        body: {
          id,
          messages,
          ability,
          abilityContext:
            ability === "copy"
              ? { copy: contextRef.current.copy, activeCopyPage: contextRef.current.activeCopyPage, funnelName: contextRef.current.funnelName, funnelId: contextRef.current.funnelId }
              : ability === "builder"
                ? { builderPages: contextRef.current.builderPages, activeBuilderPagePath: contextRef.current.activeBuilderPagePath, funnelName: contextRef.current.funnelName, funnelId: contextRef.current.funnelId }
                : ability === "intelligence"
                  ? { activeSectionId: contextRef.current.activeSectionId, activeSectionContent: contextRef.current.activeSectionContent, reportData: contextRef.current.reportData, funnelName: contextRef.current.funnelName, funnelId: contextRef.current.funnelId }
                  : {
                      activeEmail: contextRef.current.activeEmail,
                      activePage: contextRef.current.activePage,
                      activeEmailIndex: contextRef.current.activeEmailIndex,
                      emailSequence: contextRef.current.emailSequence,
                      funnelName: contextRef.current.funnelName,
                      funnelId: contextRef.current.funnelId,
                    },
        },
      }),
    }),
    onFinish: ({ message }) => {
      console.log(
        "[OfferIQAgent] onFinish message:",
        JSON.stringify(message, null, 2),
      );
      const parts = message.parts ?? [];

      // Look for completed tool results representing executing skills
      for (const part of parts as any[]) {
        const result = part?.result ?? part?.output;
        if (result?.success) {
          toast.success("Skill executed successfully!");
          const action = result.action;
          const data = result.data;

          if (ability === "email-sequence") {
            if (action === "edit_email" && onUpdateEmail) {
              const updated: EmailCopy = {
                ...activeEmail,
                ...data,
                page: activePage!,
                day: activeEmail?.day ?? 1,
              };
              onUpdateEmail(updated);
            } else if (action === "add_email" && onAddEmail) {
              const newEmail: EmailCopy = {
                ...data,
                page: activePage!,
              };
              onAddEmail(newEmail);
            } else if (action === "delete_email" && onDeleteActiveEmail) {
              onDeleteActiveEmail();
            }
          } else if (ability === "copy") {
            if (
              action === "edit_page_copy" &&
              onUpdateCopyPage &&
              data?.html
            ) {
              // Use the explicit page key from the tool result, falling back to activeCopyPage
              const targetPage = (data?.page as FunnelPageKey) || activeCopyPage;
              if (targetPage) {
                onUpdateCopyPage(targetPage, data.html);
              }
            }
          } else if (ability === "intelligence") {
            if (
              action === "edit_intelligence" &&
              onUpdateIntelligenceSection &&
              activeSectionId
            ) {
              onUpdateIntelligenceSection(activeSectionId, data?.content || "");
            }
          } else if (ability === "builder") {
            // Builder-specific skill executions
            if (action === "edit_builder_code" && onUpdateBuilderCode) {
              // data is expected to contain { code: string }
              onUpdateBuilderCode(data?.code || "");
            } else if (
              action === "apply_builder_state" &&
              onApplyBuilderState
            ) {
              // data expected to contain { components, rootList }
              onApplyBuilderState(data?.components || {}, data?.rootList || []);
            }
          }
        }
      }
    },
    onError: (err) => {
      toast.error(err.message || "Chat error");
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

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
      localStorage.setItem(
        `offeriq_agent_history_${funnelId}`,
        JSON.stringify(messages),
      );
    }
  }, [messages, funnelId]);

  const handleClearHistory = () => {
    if (messages.length === 0) return;
    setMessages([]);
    localStorage.removeItem(`offeriq_agent_history_${funnelId}`);
    toast.success("Chat history cleared!");
  };

  const handleTryoutClick = (text: string) => {
    if (isLoading) return;
    sendMessage({ role: "user", parts: [{ type: "text", text: text }] });
  };

  const handleBallTap = () => {
    if (isDraggingRef.current) return;
    setIsPanelOpen(!isPanelOpen);
  };

  // Auto-scroll chat area on new message or stream
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isPanelOpen]);

  return (
    <>
      {/* Floating interactive ball widget with radiating sparkle aura */}
      <motion.div
        drag
        dragMomentum={false}
        dragConstraints={{
          left: 20,
          right: typeof window !== "undefined" ? window.innerWidth - 96 : 800,
          top: 20,
          bottom: typeof window !== "undefined" ? window.innerHeight - 96 : 800,
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
        style={{ touchAction: "none" }}
        className="fixed bottom-6 right-6 z-50 w-24 h-24 flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        {/* Radiating sparkle aura – extends well beyond the ball so particles emanate outward */}
        <div
          className="absolute flex items-center justify-center pointer-events-none"
          style={{
            width: "280px",
            height: "280px",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            maskImage: "radial-gradient(circle, white 35%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(circle, white 35%, transparent 80%)",
          }}
        >
          <SparkleAura
            particleColor="#67e8f9"
            particleDensity={150}
            minSize={0.6}
            maxSize={2.0}
            speed={3}
            className="w-full h-full"
          />
        </div>

        {/* Rotating orbital ring */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="w-[88px] h-[88px] rounded-full border border-cyan-500/20 shadow-[0_0_20px_rgba(56,189,248,0.12)]" />
        </motion.div>

        {/* Pulsing glow ring */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.12, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-[-4px] rounded-full bg-cyan-400/10 blur-md pointer-events-none"
        />

        {/* Core ball */}
        <div className="relative w-16 h-16 rounded-full bg-[#0a0d18] border border-white/10 flex items-center justify-center shadow-[0_4px_24px_rgba(0,0,0,0.6),0_0_40px_rgba(6,182,212,0.15)] overflow-hidden z-10">
          <div className="absolute inset-0 rounded-full border border-cyan-500/25" />
          <Image
            src="/bot-floating-ball-image.png"
            alt="OfferIQ Bot"
            width={56}
            height={56}
            className="w-14 h-14 rounded-full object-cover"
            priority
          />
      </div>
      </motion.div>

      {/* Slide-out Panel Drawer (No dark background backdrop overlay) */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-[380px] h-screen bg-[#080b14] border-l border-white/10 shadow-[-15px_0_40px_rgba(0,0,0,0.7)] flex flex-col pointer-events-auto"
          >
            {/* Panel Top header */}
            <div className="px-5 py-4 bg-gradient-to-r from-[#0d111e] to-[#101729] border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/15 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.1)]">
                  <Brain className="w-[18px] h-[18px] text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-[13px] font-bold text-white tracking-tight">
                    OfferIQ Agent
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-medium text-emerald-400/80 capitalize">
                      {ability.replace("-", " ")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    title="Clear Chat History"
                    className="h-7 px-2.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 flex items-center justify-center text-[10px] font-semibold text-slate-500 transition-all duration-200 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Warning Scope Description (Context pill) */}
            <div className="px-4 py-2 bg-[#12182b] border-b border-white/5 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-400 leading-relaxed">
                {ability === "copy" ? (
                  <>
                    Operating strictly within the <strong>Copy Editing</strong>{" "}
                    scope. Cannot build or modify landing pages, change layouts,
                    or edit page builders.
                  </>
                ) : ability === "intelligence" ? (
                  <>
                    Operating strictly within the{" "}
                    <strong>Sales Intelligence</strong> scope. Cannot build landing
                    pages or edit email campaigns.
                  </>
                ) : (
                  <>
                    Operating strictly within the{" "}
                    <strong>Email Sequence</strong> scope. Cannot build landing
                    pages or adjust layout sections.
                  </>
                )}
              </p>
            </div>

            {/* Quick Action Chips */}
            <div className="px-5 py-3 bg-[#080c18] border-b border-white/[0.04] flex flex-col gap-2">
              <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Quick actions
              </span>
              <div className="flex flex-wrap gap-1.5">
                {tryouts.map((t) => (
                  <button
                    key={t}
                    disabled={isLoading}
                    onClick={() => handleTryoutClick(t)}
                    className="px-3 py-1.5 rounded-full border border-white/[0.06] hover:border-cyan-500/30 bg-white/[0.02] hover:bg-cyan-500/[0.06] text-[10px] font-medium text-slate-400 hover:text-cyan-300 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#060810] custom-scrollbar scroll-smooth">
              <div className="flex flex-col gap-4">
                {/* Initial welcome message if empty */}
                {messages.length === 0 && (
                  <div className="flex gap-3 items-start mt-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/15 to-blue-600/15 border border-cyan-500/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="bg-[#0e1322] border border-white/[0.05] rounded-2xl rounded-tl-sm px-4 py-3.5 max-w-[85%]">
                      <p className="text-xs font-semibold text-white mb-2">
                        Welcome to OfferIQ
                      </p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {ability === "copy" ? (
                          <>
                            Operating under the <strong className="text-slate-200">Copy Editing</strong> ability.
                            I can rewrite headlines, improve CTAs, audit copy for objections,
                            and optimize your page copy for conversions.
                          </>
                        ) : ability === "intelligence" ? (
                          <>
                            Operating under the <strong className="text-slate-200">Sales Intelligence</strong> ability.
                            I can rewrite report sections, generate data charts,
                            embed relevant videos, and optimize your intelligence readouts.
                          </>
                        ) : (
                          <>
                            Operating under the <strong className="text-slate-200">Email Sequence</strong> ability.
                            I can edit email copy, draft follow-ups, optimize tone,
                            or run readability analysis.
                          </>
                        )}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-2.5 font-medium">
                        Select a quick action above or type your request below.
                      </p>
                    </div>
                  </div>
                )}

                {/* Message items */}
                {messages.map((m) => {
                  const isUser = m.role === "user";
                  const textContent =
                    m.parts && m.parts.length > 0
                      ? m.parts
                          .filter((p: any) => p.type === "text")
                          .map((p: any) => p.text)
                          .join("")
                      : (m as any).content || (m as any).text || "";

                  // Extract tool invocations from either m.toolInvocations or m.parts
                  const invocations =
                    (m as any).toolInvocations &&
                    (m as any).toolInvocations.length > 0
                      ? (m as any).toolInvocations
                      : (m.parts ?? [])
                          .filter(
                            (p: any) =>
                              p.type === "tool-invocation" ||
                              p.type === "tool-result" ||
                              p.type === "tool-call" ||
                              (typeof p.type === "string" &&
                                p.type.startsWith("tool-")),
                          )
                          .map((p: any) => {
                            const base = p.toolInvocation ?? p;
                            // Handle new AI SDK 3.0.x format where type is 'tool-<name>'
                            if (p.type?.startsWith("tool-") && !base.toolName) {
                              base.toolName = p.type.replace("tool-", "");
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
                      className={cn(
                        "flex gap-3 items-start w-full",
                        isUser ? "justify-end" : "justify-start",
                      )}
                    >
                      {!isUser && (
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/15 to-blue-600/15 border border-cyan-500/15 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-4 h-4 text-cyan-400" />
                        </div>
                      )}

                      <div
                        className={cn(
                          "rounded-2xl px-4 py-3 max-w-[85%] text-xs flex flex-col gap-1",
                          isUser
                            ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm shadow-[0_4px_16px_rgba(79,70,229,0.2)]"
                            : "bg-[#0e1322] border border-white/[0.05] text-slate-300 rounded-tl-sm",
                        )}
                      >
                        {parseMessageText(
                          textContent || (m as any).content || "",
                        )}

                        {/* Rendering skills invocations feedback */}
                        {invocations.map((invocator: any, i: number) => {
                          const toolName =
                            invocator.toolName ?? invocator.toolCall?.name;
                          const actionLabel =
                            toolName === "edit_email_content"
                              ? "editing email copy"
                              : toolName === "add_new_email"
                                ? "adding follow-up email"
                                : toolName === "delete_active_email"
                                  ? "deleting email"
                                  : toolName === "edit_builder_page"
                                    ? "generating layout code"
                                    : "analyzing content";

                          const toolResult =
                            invocator.result ??
                            invocator.output ??
                            invocator.toolInvocation?.result;
                          const toolArgs =
                            invocator.args ?? invocator.toolInvocation?.args;
                          const isCompleted =
                            !!toolResult ||
                            invocator.state === "result" ||
                            invocator.state === "output-available" ||
                            (status !== "streaming" && status !== "submitted");

                          // Use toolArgs as fallback if toolResult is empty (happens during stream or maxSteps=1 disconnect)
                          const rawData =
                            toolResult?.data ?? toolResult ?? toolArgs;

                          // Extract target data mapping with safety fallback values
                          const isSuggestEmail =
                            rawData?.action === "suggest_email" ||
                            !!rawData?.analysis;
                          const suggestData =
                            rawData?.action === "suggest_email"
                              ? rawData.data
                              : rawData;

                          const isEditEmail =
                            rawData?.action === "edit_email" ||
                            (!!rawData?.subject && !rawData?.suggestions);
                          const editData =
                            rawData?.action === "edit_email"
                              ? rawData.data
                              : rawData;

                          const isAddEmail =
                            rawData?.action === "add_email" ||
                            (!!rawData?.day && !!rawData?.subject);
                          const addData =
                            rawData?.action === "add_email"
                              ? rawData.data
                              : rawData;

                          return (
                            <div key={i} className="mt-2">
                              {/* Status block */}
                              <div
                                className={cn(
                                  "flex items-center gap-1.5 text-[10px] font-semibold",
                                  isUser ? "text-white/70" : "text-cyan-400/80",
                                )}
                              >
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
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                                          Copy audit & Objections
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[10px] text-slate-400">
                                            Tone Score:
                                          </span>
                                          <span
                                            className={cn(
                                              "px-1.5 py-0.5 rounded text-[10px] font-black",
                                              (suggestData.toneScore ?? 0) >= 80
                                                ? "bg-emerald-500/20 text-emerald-400"
                                                : (suggestData.toneScore ??
                                                      0) >= 60
                                                  ? "bg-amber-500/20 text-amber-400"
                                                  : "bg-rose-500/20 text-rose-400",
                                            )}
                                          >
                                            {suggestData.toneScore ?? 0}/100
                                          </span>
                                        </div>
                                      </div>

                                      <p className="text-[11px] text-slate-300 leading-relaxed">
                                        {suggestData.analysis}
                                      </p>

                                      {suggestData.suggestions &&
                                        suggestData.suggestions.length > 0 && (
                                          <div className="space-y-1.5 pt-1">
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                              Actionable Suggestions:
                                            </span>
                                            <ul className="space-y-1">
                                              {suggestData.suggestions.map(
                                                (
                                                  suggestion: string,
                                                  idx: number,
                                                ) => (
                                                  <li
                                                    key={idx}
                                                    className="text-[11px] text-slate-300 flex items-start gap-1.5 leading-relaxed"
                                                  >
                                                    <span className="text-cyan-400 shrink-0 mt-0.5">
                                                      ✦
                                                    </span>
                                                    <span>{suggestion}</span>
                                                  </li>
                                                ),
                                              )}
                                            </ul>
                                          </div>
                                        )}
                                    </div>
                                  )}

                                  {isEditEmail && editData && (
                                    <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 space-y-1">
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                                        Email Copy Tweaked
                                      </span>
                                      <div className="text-[10px] text-slate-300 space-y-0.5">
                                        <p>
                                          <strong>Subject:</strong>{" "}
                                          {editData.subject}
                                        </p>
                                        <p>
                                          <strong>Preview:</strong>{" "}
                                          {editData.preview}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {isAddEmail && addData && (
                                    <div className="p-2.5 rounded-lg bg-indigo-500/5 border border-indigo-500/10 space-y-1">
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400">
                                        New Email Added (Day {addData.day})
                                      </span>
                                      <div className="text-[10px] text-slate-300 space-y-0.5">
                                        <p>
                                          <strong>Subject:</strong>{" "}
                                          {addData.subject}
                                        </p>
                                        <p>
                                          <strong>Preview:</strong>{" "}
                                          {addData.preview}
                                        </p>
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
                        <div className="w-8 h-8 rounded-xl bg-[#171e33] border border-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Loading state indicator */}
                {isLoading &&
                  messages.length > 0 &&
                  messages[messages.length - 1].role === "user" && (
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/15 to-blue-600/15 border border-cyan-500/15 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="bg-[#0e1322] border border-white/[0.05] px-4 py-3 rounded-2xl rounded-tl-sm flex items-center space-x-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/70 animate-bounce" />
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/70 animate-bounce delay-75" />
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/70 animate-bounce delay-150" />
                      </div>
                    </div>
                  )}

                <div ref={bottomRef} />
              </div>
            </div>

            {/* Input area */}
            <div className="p-4 bg-gradient-to-t from-[#0a0e1c] to-[#0d111e] border-t border-white/[0.05] shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!inputValue.trim() || isLoading) return;
                  sendMessage({
                    role: "user",
                    parts: [{ type: "text", text: inputValue.trim() }],
                  });
                  setInputValue("");
                }}
                className="flex items-center gap-2 bg-[#060810] border border-white/[0.06] focus-within:border-cyan-500/30 rounded-xl px-3.5 py-2 transition-all duration-200"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your request..."
                  className="flex-1 bg-transparent border-0 text-slate-200 outline-none text-[12px] placeholder:text-slate-600 focus:ring-0 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (!inputValue.trim() || isLoading) return;
                      sendMessage({
                        role: "user",
                        parts: [{ type: "text", text: inputValue.trim() }],
                      });
                      setInputValue("");
                    }
                  }}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-8 w-8 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shrink-0 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.15)] border-0 transition-all duration-200 disabled:opacity-30 disabled:shadow-none"
                  disabled={isLoading || !inputValue.trim()}
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
