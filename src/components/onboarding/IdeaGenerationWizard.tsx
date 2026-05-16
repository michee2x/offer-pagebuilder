"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { CurrencyCode } from "@/lib/offer-types";

const skillsOptions = [
  "Social Media", "Writing & Content", "Graphic Design", "Teaching / Coaching",
  "Sales & Marketing", "Tech / Coding", "Finance & Accounting", "Health & Fitness",
  "Real Estate", "Video & Photography", "E-commerce", "Music & Arts",
];

const audienceOptions = [
  "Entrepreneurs", "Students", "Working Professionals", "Small Business Owners",
  "Creators & Influencers", "Stay-at-home Parents", "General / Anyone",
];

const countryOptions = [
  "Nigeria", "Ghana", "Kenya", "South Africa", "United States",
  "United Kingdom", "Canada", "Australia", "Other",
];

interface GeneratedIdea {
  title: string;
  description: string;
  demand: string;
  competition: string;
  fit: string;
}

interface IdeaGenerationWizardProps {
  currentStep: "B1" | "B2" | "B3";
  skills: string[];
  toggleSkill: (skill: string) => void;
  customSkill: string;
  setCustomSkill: (skill: string) => void;
  audienceTypes: string[];
  toggleAudience: (aud: string) => void;
  bCountry: string;
  setBCountry: (country: string) => void;
  bCurrency: CurrencyCode;
  setBCurrency: (currency: CurrencyCode) => void;
  budget: string;
  setBudget: (budget: string) => void;
  generatedIdeas: GeneratedIdea[];
  pickedIdea: number;
  setPickedIdea: (index: number) => void;
  isGenerating: boolean;
  onNext: () => void;
  errors: Record<string, string>;
}

const selectCls =
  "w-full bg-white/[0.12] border border-white/10 rounded-lg px-4 h-12 text-base text-white focus:outline-none focus:border-white transition-all appearance-none cursor-pointer placeholder:text-white/40";

const labelCls =
  "block text-base font-medium text-white mb-2";

export function IdeaGenerationWizard({
  currentStep,
  skills,
  toggleSkill,
  customSkill,
  setCustomSkill,
  audienceTypes,
  toggleAudience,
  bCountry,
  setBCountry,
  bCurrency,
  setBCurrency,
  budget,
  setBudget,
  generatedIdeas,
  pickedIdea,
  setPickedIdea,
  isGenerating,
  onNext,
  errors,
}: IdeaGenerationWizardProps) {
  return (
    <div className="max-w-[720px] mx-auto w-full relative z-10">
      <div className="relative group/container">
        {/* Gallereee Background Container */}
        <div className="absolute inset-0 bg-white/[0.08] backdrop-blur-[5px] rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] -z-10 transition-all duration-500" />

        <div className="px-8 py-12 md:px-12">
          <AnimatePresence mode="wait">
        {currentStep === "B1" && (
          <motion.div
            key="B1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-[26px] font-bold text-white tracking-tight">What are you good at?</h2>
              <p className="text-[13px] text-white/50 mt-1">Select the skills or areas you have experience in.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {skillsOptions.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                    className={cn(
                      "p-4 rounded-xl border text-[13px] font-medium transition-all text-center",
                      skills.includes(skill)
                        ? "bg-white text-black border-white"
                        : "bg-white/5 border-white/10 text-white/50 hover:border-white/20 hover:text-white"
                    )}
                >
                  {skill}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className={labelCls}>Or describe your unique strength</label>
              <Input
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                placeholder="e.g., I'm a pro at helping people lose weight with keto"
              />
            </div>

            {errors.skills && <Err msg={errors.skills} />}

            <div className="pt-4">
              <button
                onClick={onNext}
                className="w-full h-14 rounded-full bg-white text-black font-bold text-[15px] tracking-wide hover:bg-zinc-200 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
              >
                Continue <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === "B2" && (
          <motion.div
            key="B2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-[26px] font-bold text-white tracking-tight">Who should this serve?</h2>
              <p className="text-[13px] text-white/50 mt-1">Define your target audience and market.</p>
            </div>

            <div className="space-y-4">
              <label className={labelCls}>Target Audience</label>
              <div className="grid grid-cols-2 gap-3">
                {audienceOptions.map((aud) => (
                  <button
                    key={aud}
                    onClick={() => toggleAudience(aud)}
                    className={cn(
                      "p-3 rounded-xl border text-[12px] font-medium transition-all text-center",
                      audienceTypes.includes(aud)
                        ? "bg-white text-black border-white"
                        : "bg-white/5 border-white/10 text-white/50 hover:border-white/20 hover:text-white"
                    )}
                  >
                    {aud}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Target Country</label>
                <div className="relative">
                  <select
                    className={selectCls}
                    value={bCountry}
                    onChange={(e) => setBCountry(e.target.value)}
                  >
                    <option value="" disabled className="bg-[#1a1a1a]">Select country</option>
                    {countryOptions.map((c) => (
                      <option key={c} value={c} className="bg-[#1a1a1a]">{c}</option>
                    ))}
                  </select>
                  <Chevron />
                </div>
              </div>
              <div>
                <label className={labelCls}>Currency</label>
                <div className="relative">
                  <select
                    className={selectCls}
                    value={bCurrency}
                    onChange={(e) => setBCurrency(e.target.value as CurrencyCode)}
                  >
                    <option value="" disabled className="bg-[#1a1a1a]">Select currency</option>
                    {["USD", "GBP", "EUR", "NGN", "GHS", "KES", "ZAR"].map((curr) => (
                      <option key={curr} value={curr} className="bg-[#1a1a1a]">{curr}</option>
                    ))}
                  </select>
                  <Chevron />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelCls}>Price Range</label>
              <div className="relative">
                <select
                  className={selectCls}
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                >
                  <option value="" disabled className="bg-[#1a1a1a]">Select price range</option>
                  <option value="$10 - $50" className="bg-[#1a1a1a]">$10 - $50 (Low Ticket)</option>
                  <option value="$50 - $200" className="bg-[#1a1a1a]">$50 - $200 (Mid Ticket)</option>
                  <option value="$200 - $1000" className="bg-[#1a1a1a]">$200 - $1000 (High Ticket)</option>
                  <option value="$1000+" className="bg-[#1a1a1a]">$1000+ (Premium)</option>
                </select>
                <Chevron />
              </div>
            </div>

            {errors.audienceTypes && <Err msg={errors.audienceTypes} />}

            <div className="pt-4">
              <button
                onClick={onNext}
                className="w-full h-14 rounded-full bg-white text-black font-bold text-[15px] tracking-wide hover:bg-zinc-200 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
              >
                Generate Ideas <Sparkles className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === "B3" && (
          <motion.div
            key="B3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-[26px] font-bold text-white tracking-tight">Choose your best idea</h2>
              <p className="text-[13px] text-white/50 mt-1">We&apos;ve architected a few offers based on your skills.</p>
            </div>

            {isGenerating ? (
              <div className="py-24 flex flex-col items-center justify-center space-y-5">
                <Spinner size="lg" />
                <p className="text-[13px] text-[#555] animate-pulse">Brainstorming with AI...</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {generatedIdeas.map((idea, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPickedIdea(idx)}
                    className={cn(
                      "w-full p-6 rounded-2xl border text-left transition-all relative group",
                      pickedIdea === idx
                        ? "bg-white text-black border-white"
                        : "bg-white/5 border-white/10 hover:border-white/20"
                    )}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-[17px] font-bold text-white group-hover:text-brand-yellow transition-colors">{idea.title}</h4>
                      {pickedIdea === idx && <div className="w-5 h-5 rounded-full bg-brand-yellow flex items-center justify-center"><Check className="h-3 w-3 text-black" /></div>}
                    </div>
                    <p className="text-[13px] text-white/50 leading-relaxed mb-5">{idea.description}</p>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1.5">Market Demand</span>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-brand-yellow/40 rounded-full" style={{ width: idea.demand === 'High' ? '90%' : idea.demand === 'Medium' ? '60%' : '30%' }} />
                        </div>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1.5">Your Fit</span>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-green-500/40 rounded-full" style={{ width: idea.fit === 'High' ? '90%' : idea.fit === 'Medium' ? '60%' : '30%' }} />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {errors.pickedIdea && <Err msg={errors.pickedIdea} />}

            <div className="pt-4">
              <button
                onClick={onNext}
                disabled={pickedIdea === -1 || isGenerating}
                className="w-full h-14 rounded-full bg-white text-black font-bold text-[15px] tracking-wide hover:bg-zinc-200 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
              >
                Confirm and Start Analysis
              </button>
            </div>
          </motion.div>
        )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ── Micro-components ── */

function Err({ msg }: { msg: string }) {
  return <p className="text-xs text-red-400 mt-2">{msg}</p>;
}

function Chevron() {
  return (
    <svg
      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#555]"
      width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
