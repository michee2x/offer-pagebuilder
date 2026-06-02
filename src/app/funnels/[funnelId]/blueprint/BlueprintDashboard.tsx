"use client";

import React, { useState, useRef, useEffect } from "react";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Extract intelligence data to send to the AI
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

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleGeneratePdf(topic: string) {
    if (!topic) {
      toast.error("Please agree on a topic first.");
      return;
    }

    setIsGeneratingPdf(true);
    const generationToast = toast.loading(
      "Generating your Lead Magnet PDF... This might take a minute.",
    );

    try {
      const res = await fetch(`/api/generate-blueprint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ funnelId, topic }),
      });

      if (!res.ok) throw new Error("Failed to generate PDF");
      const data = await res.json();

      setBlueprintUrl(data.pdfUrl);
      toast.success("Blueprint PDF generated successfully!", {
        id: generationToast,
      });
    } catch (err) {
      console.error(err);
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
    sendMessage({ role: "user", parts: [{ type: "text", text: content }] });
  };

  const hasChatStarted = messages.length > 0;

  const getMessageText = (message: any) =>
    (message?.parts ?? [])
      .filter((part: any) => part.type === "text")
      .map((part: any) => part.text)
      .join("")
      .trim();

  const lastUserMessage = [...messages]
    .reverse()
    .find((message: any) => message.role === "user");
  const lastUserText = getMessageText(lastUserMessage) || "Blueprint Topic";

  // Render the Generated PDF View
  if (blueprintUrl) {
    return (
      <main className="flex-1 overflow-hidden p-4 md:p-8 relative z-10 flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0d14] to-[#131826]">
        <div className="w-full max-w-4xl flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-3xl p-12 text-center shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-indigo/10 to-transparent pointer-events-none" />
          <FileText className="w-24 h-24 text-brand-indigo mb-6 drop-shadow-2xl" />
          <h2 className="text-4xl font-black text-white mb-4 tracking-tight">
            Your Blueprint is Ready
          </h2>
          <p className="text-white/60 mb-10 max-w-lg text-lg leading-relaxed">
            This PDF will be automatically emailed to any leads who fill out the
            form on your published funnel.
          </p>
          <div className="flex gap-4">
            <Button
              asChild
              size="lg"
              className="h-14 bg-brand-indigo hover:bg-brand-indigo/90 text-white font-bold px-10 rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.4)] text-base"
            >
              <a href={blueprintUrl} target="_blank" rel="noopener noreferrer">
                <Download className="w-5 h-5 mr-2" />
                Download PDF
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setBlueprintUrl(null)}
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
    <main className="flex-1 overflow-hidden relative z-10 flex flex-col items-center justify-center bg-[#0a0d14]">
      {/* Background gradients for premium feel */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-indigo/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-brand-blue/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-3xl flex flex-col h-full relative z-10 p-4 md:p-8">
        {/* Chat History View */}
        {hasChatStarted ? (
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
              {messages.length > 1 && (
                <Button
                  onClick={() => handleGeneratePdf(lastUserText)}
                  disabled={isGeneratingPdf}
                  className="bg-white hover:bg-white/90 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all"
                >
                  {isGeneratingPdf ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Generate PDF
                </Button>
              )}
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
                    {m.content}
                  </p>
                </div>
              </div>
            ))}
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
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 drop-shadow-sm">
              Design a Lead Magnet
            </h1>
            <p className="text-lg text-white/50 mb-12 max-w-xl font-medium">
              I can analyze your funnel's sales intelligence to suggest
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
              {[
                {
                  icon: Lightbulb,
                  title: "Suggest topics",
                  desc: "Based on my funnel intelligence",
                },
                {
                  icon: PenTool,
                  title: "Checklist",
                  desc: "Create a step-by-step checklist",
                },
                {
                  icon: Target,
                  title: "Action Plan",
                  desc: "Write a 30-day action plan",
                },
                {
                  icon: FileText,
                  title: "Resource Guide",
                  desc: "Curate a list of top tools",
                },
              ].map((card, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const content = `${card.title}. ${card.desc}.`;
                    setInputValue(card.title);
                    sendMessage({
                      role: "user",
                      parts: [{ type: "text", text: content }],
                    });
                  }}
                  className="flex flex-col text-left p-5 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/10 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <card.icon className="w-5 h-5 text-white/50 group-hover:text-brand-indigo transition-colors" />
                    <span className="font-bold text-white/90">
                      {card.title}
                    </span>
                  </div>
                  <span className="text-sm text-white/40 font-medium">
                    {card.desc}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
