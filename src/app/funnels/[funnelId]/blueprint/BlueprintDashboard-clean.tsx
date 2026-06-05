"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Download,
  RefreshCw,
  FileText,
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
  if (!topicsMatch) return [];

  const topicsText = topicsMatch[1];
  const topics: string[] = [];

  for (const line of topicsText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = trimmed.match(/^\d+\.\s+(.+)$/);
    if (match) {
      const topic = match[1].trim();
      if (topic && !topics.includes(topic)) {
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
  const [blueprintUrl, setBlueprintUrl] = useState<string | null>(
    initialBlocks?.blueprintUrl || null,
  );
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const intelligenceData = {
    call1: initialBlocks?.call1,
    call2: initialBlocks?.call2,
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

  const getMessageText = (message: any) => {
    const raw = (message?.parts ?? [])
      .filter((part: any) => part.type === "text")
      .map((part: any) => part.text)
      .join("")
      .trim();

    return raw.replace(/<\/?topics>/g, "").trim();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleGeneratePdf(topic: string) {
    if (!topic) {
      toast.error("Please select a topic first.");
      return;
    }

    setIsGeneratingPdf(true);
    const generationToast = toast.loading(
      setGenerationStatus("Writing blueprint content (this takes a few minutes)...")
    );

    try {
      const htmlRes = await fetch(`/api/generate-blueprint/html`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ funnelId, topic, type: topicMode }),
      });

      if (!htmlRes.ok) throw new Error("Failed to write blueprint HTML content");
      const htmlData = await htmlRes.json();
      
      setGenerationStatus("Rendering PDF document and saving...");
      const pdfRes = await fetch(`/api/generate-blueprint/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ funnelId, html: htmlData.html, topic, type: topicMode }),
      });

      if (!pdfRes.ok) throw new Error("Failed to generate PDF from HTML");
      const data = await pdfRes.json();

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
      console.error(err);
      toast.error("Error generating PDF.", {
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
    sendMessage({ role: "user", parts: [{ type: "text", text: content }] });
  };

  const hasChatStarted = messages.length > 0;

  const lastAssistantMessage = [...messages]
    .reverse()
    .find((message: any) => message.role === "assistant");
  const lastAssistantText = getMessageText(lastAssistantMessage);
  const suggestedTopics = parseSuggestedTopics(lastAssistantText);

  useEffect(() => {
    if (suggestedTopics.length > 0 && !selectedTopic) {
      setSelectedTopic(suggestedTopics[0]);
    }
  }, [suggestedTopics, selectedTopic]);

  // Generated PDF View
  if (blueprintUrl) {
    return (
      <main className="flex-1 overflow-hidden p-4 md:p-8 relative z-10 flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0d14] to-[#131826]">
        <div className="w-full max-w-4xl flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-3xl p-12 text-center shadow-2xl backdrop-blur-md">
          <FileText className="w-24 h-24 text-brand-indigo mb-6 drop-shadow-2xl" />
          <h2 className="text-4xl font-black text-white mb-4 tracking-tight">
            Your Blueprint is Ready
          </h2>
          <p className="text-white/60 mb-10 max-w-lg text-lg leading-relaxed">
            This PDF will be emailed to leads on your funnel.
          </p>
          <div className="flex gap-4">
            <Button
              asChild
              size="lg"
              className="h-14 bg-brand-indigo hover:bg-brand-indigo/90 text-white font-bold px-10 rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.4)] text-base"
            >
              <a href={blueprintUrl} target="_blank" rel="noopener noreferrer">
                <Download className="w-5 h-5 mr-2" />
                Download
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setBlueprintUrl(null);
                setSelectedTopic("");
              }}
              className="h-14 bg-white/5 hover:bg-white/10 border-white/10 text-white font-bold px-10 rounded-2xl text-base"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Create New
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-hidden relative z-10 flex flex-col bg-[#0a0d14]">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-indigo/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-brand-blue/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-2xl mx-auto flex flex-col h-full relative z-10 p-4 md:p-8">
        {/* Chat Messages */}
        <div
          className={`${
            hasChatStarted ? "flex-1 overflow-y-auto mb-4 pr-2" : "flex-1 flex items-center justify-center"
          }`}
        >
          {!hasChatStarted ? (
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
                Design a Lead Magnet
              </h1>
              <p className="text-base text-white/50 mb-8 max-w-lg mx-auto">
                I&apos;ll suggest topics or you tell me what you want to build.
              </p>
            </div>
          ) : (
            <div className="space-y-3 w-full">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs rounded-2xl p-3 ${
                      m.role === "user"
                        ? "bg-brand-indigo text-white shadow-lg"
                        : "bg-white/5 text-white/90 border border-white/10 shadow-md"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">
                      {getMessageText(m)}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-indigo animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-indigo animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-indigo animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Topic Selection */}
        {hasChatStarted && suggestedTopics.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
            <div className="flex gap-2">
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger className="flex-1 bg-[#131826] border-white/10 text-white rounded-xl h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#131826] border-white/10">
                  {suggestedTopics.map((topic) => (
                    <SelectItem key={topic} value={topic} className="text-sm">
                      {topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => handleGeneratePdf(selectedTopic)}
                disabled={isGeneratingPdf || !selectedTopic}
                size="sm"
                className="bg-brand-indigo hover:bg-brand-indigo/90 text-white font-bold px-4 rounded-xl whitespace-nowrap h-10"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSend} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-indigo to-brand-blue rounded-3xl blur opacity-25 group-hover:opacity-40 transition" />
          <div className="relative flex items-center bg-[#131826] border border-white/10 rounded-3xl overflow-hidden p-2 pl-4">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                hasChatStarted
                  ? "Ask for more..."
                  : "Tell me what to create..."
              }
              className="flex-1 bg-transparent border-none px-2 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none"
            />
            <Button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="w-10 h-10 rounded-2xl bg-brand-indigo hover:bg-brand-indigo/90 text-white shrink-0 ml-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>

        {/* Quick Starts */}
        {!hasChatStarted && (
          <div className="grid grid-cols-2 gap-2 mt-6">
            {[
              {
                icon: Lightbulb,
                title: "Suggest topics",
              },
              {
                icon: PenTool,
                title: "Checklist",
              },
              {
                icon: Target,
                title: "Action Plan",
              },
              {
                icon: FileText,
                title: "Guide",
              },
            ].map((card, i) => (
              <button
                key={i}
                onClick={() => {
                  sendMessage({
                    role: "user",
                    parts: [{ type: "text", text: card.title }],
                  });
                }}
                className="flex items-center gap-2 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition text-left"
              >
                <card.icon className="w-4 h-4 text-white/50 flex-shrink-0" />
                <span className="font-medium text-white/90 text-sm">
                  {card.title}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
