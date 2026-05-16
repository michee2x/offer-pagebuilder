"use client";

import React, { useState } from "react";
import { Link2, CheckCircle, Loader2 } from "lucide-react";

interface WebsiteUrlFormProps {
  onBack?: () => void;
  onSubmit: (summaryText: string) => void;
}

export function WebsiteUrlForm({ onBack, onSubmit }: WebsiteUrlFormProps) {
  const [url, setUrl] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleScrape = async () => {
    if (!url.trim()) {
      setError("Please enter a valid URL.");
      return;
    }
    
    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL (e.g., https://example.com).");
      return;
    }

    setIsScraping(true);
    setError("");

    try {
      const res = await fetch("/api/offer-intelligence/parse-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        throw new Error("Failed to process website content.");
      }

      const data = await res.json();
      setSummary(data.summary || "");
      setIsSummarizing(true);
    } catch (err: any) {
      setError(err.message || "An error occurred while parsing the website.");
    } finally {
      setIsScraping(false);
    }
  };

  const handleFinalSubmit = () => {
    if (!summary.trim()) {
      setError("Summary cannot be empty.");
      return;
    }
    onSubmit(summary);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Extract from a Website</h2>
        <p className="text-white/60">Enter the URL of a sales page or business website. Our AI will analyze the content and model the core strategy.</p>
      </div>

      {!isSummarizing ? (
        <div className="relative group/container">
          {/* Gallereee Background Container */}
          <div className="absolute inset-0 bg-white/[0.08] backdrop-blur-[5px] rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] -z-10 transition-all duration-500" />
          
          <div className="px-8 py-10 md:px-12">
            <div className="flex flex-col gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Link2 className="h-5 w-5 text-white/40" />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-competitor-or-inspiration.com"
                className="w-full h-14 pl-12 pr-4 bg-white/[0.08] border border-white/10 rounded-lg text-base text-white focus:outline-none focus:border-white transition-all placeholder:text-white/40"
              />
            </div>
            
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              onClick={handleScrape}
              disabled={!url || isScraping}
              className="w-full h-14 mt-4 rounded-full bg-white text-black font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
            >
              {isScraping ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Website...
                </>
              ) : (
                "Analyze Website"
              )}
            </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative group/container">
          {/* Gallereee Background Container */}
          <div className="absolute inset-0 bg-white/[0.08] backdrop-blur-[5px] rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] -z-10 transition-all duration-500" />
          
          <div className="px-8 py-10 md:px-12">
            <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <h3 className="text-xl font-bold text-white">Strategy Extracted</h3>
          </div>
          
          <p className="text-white/70 text-sm mb-4">
            We've generated a summary of the strategy based on the website. Please review and edit the details below before generating your sales intelligence.
          </p>

          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full h-64 bg-white/10 border border-white/10 rounded-lg p-4 text-white text-base focus:outline-none focus:border-white transition-all mb-6 resize-none placeholder:text-white/40"
            placeholder="Edit the extracted strategy..."
          />

          <button
            onClick={handleFinalSubmit}
            className="w-full h-14 rounded-full bg-white text-black font-bold tracking-wide hover:bg-zinc-200 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
          >
            Generate Sales Intelligence
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
