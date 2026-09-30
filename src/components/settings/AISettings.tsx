"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Key, HelpCircle, BookOpen, ExternalLink } from "lucide-react";

export function AISettings() {
  const [anthropicKey, setAnthropicKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUnlimited, setIsUnlimited] = useState(false);

  useEffect(() => {
    async function fetchKeys() {
      try {
        const res = await fetch("/api/user/api-keys");
        if (res.ok) {
          const data = await res.json();
          setAnthropicKey(data.anthropic_key || "");
          setOpenaiKey(data.openai_key || "");
          setIsUnlimited(data.is_unlimited || false);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchKeys();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anthropic_key: anthropicKey, openai_key: openaiKey }),
      });
      
      if (!res.ok) throw new Error("Failed to save API keys");
      
      toast.success("API keys saved successfully");
    } catch (err) {
      toast.error("Error saving API keys");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin text-brand-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">AI & Intelligence</h2>
        <p className="text-sm text-[#777]">
          Configure your Bring Your Own Key (BYOK) settings to use unlimited generations.
        </p>
      </div>

      <div className="p-6 rounded-xl border border-white/10 bg-white/5 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-medium">Bring Your Own Key (BYOK)</h3>
              <p className="text-sm text-[#777]">
                Connect your own Anthropic and OpenAI keys to bypass platform credit limits.
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${isUnlimited ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/10 text-white/60 border border-white/10'}`}>
            {isUnlimited ? 'Unlimited Plan Active' : 'Requires Unlimited Plan'}
          </div>
        </div>

        {!isUnlimited && (
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-sm">
            You must upgrade to the <strong>Unlimited</strong> plan to use custom API keys. Without the Unlimited plan, the platform will continue to use your monthly credits.
          </div>
        )}

        {isUnlimited && (
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-200 text-sm flex items-start gap-3">
            <BookOpen className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
            <span>
              Need help? Read our{" "}
              <a href="/docs" className="underline text-blue-300 hover:text-blue-200" target="_blank" rel="noreferrer">BYOK integration guide</a>{" "}
              for step-by-step instructions on getting your API keys from each platform.
            </span>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white">Anthropic API Key</label>
              <div className="flex items-center gap-3">
                <a href="https://docs.anthropic.com/en/api/getting-started" target="_blank" rel="noreferrer" className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1 transition-colors">
                  Docs <ExternalLink className="w-3 h-3" />
                </a>
                <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="text-xs text-brand-blue hover:underline flex items-center gap-1">
                  Get API Key <HelpCircle className="w-3 h-3" />
                </a>
              </div>
            </div>
            <Input 
              type="password" 
              placeholder="sk-ant-..." 
              value={anthropicKey} 
              onChange={(e) => setAnthropicKey(e.target.value)}
              className="bg-black/50 border-white/10 text-white"
              disabled={!isUnlimited}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white">OpenAI API Key</label>
              <div className="flex items-center gap-3">
                <a href="https://platform.openai.com/docs/api-reference/authentication" target="_blank" rel="noreferrer" className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1 transition-colors">
                  Docs <ExternalLink className="w-3 h-3" />
                </a>
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-xs text-brand-blue hover:underline flex items-center gap-1">
                  Get API Key <HelpCircle className="w-3 h-3" />
                </a>
              </div>
            </div>
            <Input 
              type="password" 
              placeholder="sk-..." 
              value={openaiKey} 
              onChange={(e) => setOpenaiKey(e.target.value)}
              className="bg-black/50 border-white/10 text-white"
              disabled={!isUnlimited}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/5">
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !isUnlimited}
            className="bg-brand-blue hover:bg-brand-blue/90 text-white"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Keys
          </Button>
        </div>
      </div>
    </div>
  );
}
