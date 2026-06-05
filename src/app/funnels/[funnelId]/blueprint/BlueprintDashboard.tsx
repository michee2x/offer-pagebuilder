"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Download,
  RefreshCw,
  FileText,
  Bot,
  Sparkles,
  Send,
  PenTool,
  Lightbulb,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

function parseSuggestedTopics(text: string) {
  if (!text) return [];

  const topicsMatch = text.match(/<topics>([\s\S]*?)<\/topics>/);
  const topicsText = topicsMatch ? topicsMatch[1] : text;
  const topics: string[] = [];

  for (const line of topicsText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let match = trimmed.match(/^\d+\.\s+(.+)$/);
    if (!match) {
      match = trimmed.match(/^[-*]\s+(.+)$/);
    }
    if (!match) {
      match = trimmed.match(/^(.+?)$/);
    }

    if (match) {
      const topic = match[1].trim();
      if (topic && !topics.includes(topic) && topic.length > 3) {
        topics.push(topic);
      }
    }
  }

  return topics;
}

export function BlueprintDashboard({
  funnelId,
  funnelName,
  initialBlocks,
}: {
  funnelId: string;
  funnelName: string;
  initialBlocks: any;
}) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [topicMode, setTopicMode] = useState<"lead" | "bonus" | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Extract intelligence data to send to the AI
  const intelligenceData = {
    call1: initialBlocks?.intelligence?.call1 || initialBlocks?.call1 || {},
    call2: initialBlocks?.intelligence?.call2 || initialBlocks?.call2 || {},
  };

  const { messages, status, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/agent-chat",
      prepareSendMessagesRequest: ({ messages, id }) => ({
        body: {
          id,
          messages,
          ability: "blueprint-ideation",
          funnelId,
          abilityContext: {
            funnelName,
            intelligenceData,
            topicMode,
          },
        },
      }),
    }),
    onError: (err) => {
      console.error("Chat Error:", err);
      toast.error(err.message || "Failed to send message.");
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  const getRawMessageText = (message: any) => {
    return (message?.parts ?? [])
      .filter((part: any) => part.type === "text")
      .map((part: any) => part.text)
      .join("")
      .trim();
  };

  const getMessageText = (message: any) => {
    const raw = getRawMessageText(message);

    // Strip <topics> tags from display
    return raw.replace(/<\/?topics>/g, "").trim();
  };

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleGeneratePdf(topic: string) {
    if (!topic) {
      toast.error("Please agree on a topic first.");
      return;
    }

    if (!topicMode) {
      toast.error("Please select lead or bonus generation first.");
      return;
    }

    setGenerationStatus("Starting blueprint generation...");
    setIsGeneratingPdf(true);
    const generationToast = toast.loading(
      "Generating your PDF... This might take a minute.",
    );
    console.info("[blueprint] Starting PDF generation", {
      funnelId,
      topic,
      type: topicMode,
    });

    try {
      setGenerationStatus("Sending generation request to server...");
      const res = await fetch(`/api/generate-blueprint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ funnelId, topic, type: topicMode }),
      });

      if (!res.ok) throw new Error("Failed to generate PDF");
      const data = await res.json();

      if (!data.fileId) {
        throw new Error("Missing file ID from generation response");
      }

      toast.success("Blueprint PDF generated successfully!", {
        id: generationToast,
      });
      setGenerationStatus(
        "Blueprint generated successfully. Redirecting to download...",
      );
      console.info("[blueprint] Generation response", data);
      router.push(
        `/funnels/${funnelId}/blueprint/download?funnelId=${encodeURIComponent(
          funnelId,
        )}&fileId=${encodeURIComponent(data.fileId)}`,
      );
    } catch (err) {
      console.error("[blueprint] PDF generation failed:", err);
      setGenerationStatus("PDF generation failed. See console for details.");
      toast.error("Error generating PDF. Please try again.", {
        id: generationToast,
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const content = inputValue.trim();
    setInputValue("");
    if (topicMode) {
      setSelectedTopic(content);
    }
    sendMessage({ role: "user", parts: [{ type: "text", text: content }] });
  };

  const hasChatStarted = messages.length > 0;

  const lastAssistantMessage = [...messages]
    .reverse()
    .find((message: any) => message.role === "assistant");
  const lastAssistantRawText = getRawMessageText(lastAssistantMessage);
  const suggestedTopics = parseSuggestedTopics(lastAssistantRawText);

  // Auto-select first topic when topics are parsed and none selected yet
  useEffect(() => {
    if (suggestedTopics.length > 0 && !selectedTopic) {
      setSelectedTopic(suggestedTopics[0]);
    }
  }, [suggestedTopics, selectedTopic]);

  const showTopicSuggestions = hasChatStarted && suggestedTopics.length > 0;

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
    setInputValue("");
  };

  const handleExtractLeadTopic = () => {
    setTopicMode("lead");
    setSelectedTopic("");
    sendMessage({
      role: "user",
      parts: [
        {
          type: "text",
          text: "Hi, I want to generate a Lead Magnet. Please extract the best lead topic from my report.",
        },
      ],
    });
  };

  const handleExtractBonusTopics = () => {
    setTopicMode("bonus");
    setSelectedTopic("");
    sendMessage({
      role: "user",
      parts: [
        {
          type: "text",
          text: "Hi, I want to generate some bonuses. Please extract the best bonus topics from my report.",
        },
      ],
    });
  };

  return (
    <main className="flex-1 overflow-hidden relative z-10 flex flex-col items-center justify-center bg-[#0a0d14]">
      {/* Background gradients for premium feel */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-indigo/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-brand-blue/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-3xl flex flex-col h-full relative z-10 p-4 md:p-8">
        {hasChatStarted ? (
          <>
            <div className="flex-1 overflow-y-auto mb-6 pr-2 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {/* Header in chat view */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6 sticky top-0 bg-[#0a0d14]/80 backdrop-blur-xl z-20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-indigo to-brand-blue flex items-center justify-center shadow-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">
                      Blueprint Architect
                    </h1>
                    <p className="text-xs text-white/50 font-medium">
                      Powered by AI & Sales Intelligence
                    </p>
                  </div>
                </div>
              </div>

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-3xl p-5 ${m.role === "user" ? "bg-brand-indigo text-white shadow-[0_10px_40px_-10px_rgba(99,102,241,0.5)]" : "bg-white/5 text-white/90 border border-white/10 shadow-2xl backdrop-blur-sm"}`}
                  >
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                      {getMessageText(m)}
                    </p>
                  </div>
                </div>
              ))}

              {showTopicSuggestions && (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl backdrop-blur-sm">
                  <p className="text-sm text-white/60">
                    These ideas are based on your funnel report sections. Pick a
                    topic below, or keep refining the architect’s guidance.
                  </p>
                  <p className="text-sm text-white/50">
                    Use <span className="font-semibold text-white">Generate Lead</span> or <span className="font-semibold text-white">Generate Bonus</span> first to align output with the right blueprint type. Or, if you provided your own topic in the chat and the AI approved it, it should be selected below.
                  </p>
                  <div className="grid gap-3">
                    {suggestedTopics.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => handleTopicSelect(topic)}
                        className={`w-full text-left rounded-3xl border px-4 py-3 transition-all ${
                          selectedTopic === topic
                            ? "border-brand-indigo bg-brand-indigo/10 text-white shadow-[0_0_0_1px_rgba(99,102,241,0.4)]"
                            : "border-white/10 bg-white/5 text-white/80 hover:border-white/20 hover:bg-white/10"
                        }`}
                      >
                        <span className="block text-sm font-semibold truncate">
                          {topic}
                        </span>
                        {selectedTopic === topic && (
                          <span className="mt-1 inline-block text-[11px] uppercase tracking-[0.18em] text-brand-indigo">
                            Selected
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleGeneratePdf(selectedTopic)}
                        disabled={isGeneratingPdf || !selectedTopic}
                        className="bg-brand-indigo hover:bg-brand-indigo/90 text-white font-bold px-6 py-3 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeneratingPdf ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Sparkles className="w-4 h-4 mr-2" />
                        )}
                        {topicMode === "bonus"
                          ? "Generate Bonus PDF"
                          : "Generate PDF"}
                      </Button>
                    </div>
                    {generationStatus ? (
                      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                        {generationStatus}
                      </div>
                    ) : null}
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-5 flex items-center gap-3 backdrop-blur-sm">
                    <div className="flex space-x-1.5">
                      <div className="w-2 h-2 rounded-full bg-brand-indigo animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 rounded-full bg-brand-indigo animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 rounded-full bg-brand-indigo animate-bounce" />
                    </div>
                    <span className="text-sm font-medium text-white/50">
                      Architect is typing...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 drop-shadow-sm">
              Design a Lead Magnet
            </h1>
            <p className="text-lg text-white/50 mb-12 max-w-xl font-medium">
              I can analyze your funnel&apos;s sales intelligence to suggest
              highly-converting topics, or you can tell me exactly what you want
              to build.
            </p>
          </div>
        )}

        {/* Floating Input Area */}
        <div
          className={`w-full transition-all duration-500 ${hasChatStarted ? "" : "max-w-2xl mx-auto"}`}
        >
          <form onSubmit={handleSend} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-indigo to-brand-blue rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
            <div className="relative flex items-center bg-[#131826] border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-2 pl-4">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  hasChatStarted
                    ? "Reply to the architect..."
                    : "Describe the blueprint you want to create..."
                }
                className="flex-1 bg-transparent border-none px-2 py-4 text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-0"
              />
              <Button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="w-12 h-12 rounded-2xl bg-brand-indigo hover:bg-brand-indigo/90 text-white shrink-0 ml-2 transition-all disabled:opacity-50 disabled:bg-white/10"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </form>

          {/* Quick Starts - Only show initially */}
          {!hasChatStarted && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <button
                type="button"
                onClick={handleExtractLeadTopic}
                className="flex flex-col text-left p-6 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/10 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Lightbulb className="w-5 h-5 text-white/50 group-hover:text-brand-indigo transition-colors" />
                  <span className="font-bold text-white/90 text-lg">
                    Generate Lead
                  </span>
                </div>
                <span className="text-sm text-white/40 font-medium">
                  Extract the best lead magnet topic from your Funnel Blueprint
                  section.
                </span>
              </button>
              <button
                type="button"
                onClick={handleExtractBonusTopics}
                className="flex flex-col text-left p-6 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/10 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Target className="w-5 h-5 text-white/50 group-hover:text-brand-indigo transition-colors" />
                  <span className="font-bold text-white/90 text-lg">
                    Generate Bonus
                  </span>
                </div>
                <span className="text-sm text-white/40 font-medium">
                  Extract bonus topic ideas from your Bonus Stack section.
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
