"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PdfUploadFormProps {
  onBack?: () => void;
  onSubmit: (summaryText: string) => void;
}

export function PdfUploadForm({ onBack, onSubmit }: PdfUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        setError("Please upload a valid PDF file.");
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      // We will call the new API to parse and summarize the PDF
      const res = await fetch("/api/offer-intelligence/parse-pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to process PDF");
      }

      const data = await res.json();
      setSummary(data.summary || "");
      setIsSummarizing(true);
    } catch (err: any) {
      setError(err.message || "An error occurred while parsing the PDF.");
    } finally {
      setIsUploading(false);
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
        <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Upload Your Strategy Document</h2>
        <p className="text-white/60">Upload a PDF detailing your offer, target audience, and business model. Our AI will extract the core components.</p>
      </div>

      {!isSummarizing ? (
        <div className="relative group/container">
          {/* Gallereee Background Container */}
          <div className="absolute inset-0 bg-white/[0.08] backdrop-blur-[5px] rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] -z-10 transition-all duration-500" />
          
          <div className="px-8 py-10 md:px-12">
            <div 
            className={cn(
              "border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer",
              file ? "border-brand-yellow/50 bg-brand-yellow/5" : "border-white/10 hover:border-white/20 hover:bg-white/5"
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              accept=".pdf" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
            />
            {file ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-brand-yellow/10 flex items-center justify-center text-brand-yellow">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-white/50 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
            <button className="text-sm text-white/50 hover:text-white hover:underline mt-2 transition-colors" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                  Remove file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-white font-medium">Click to upload a PDF</p>
                  <p className="text-white/50 text-sm">Max file size: 10MB</p>
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

          <div className="mt-8">
            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="w-full h-14 rounded-full bg-white text-black font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing PDF...
                </>
              ) : (
                "Extract Strategy"
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
            We've generated a summary of your offer based on the document. Please review and edit the details below before generating your sales intelligence.
          </p>

          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full h-64 bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-brand-yellow/50 transition-colors mb-6 resize-none"
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
