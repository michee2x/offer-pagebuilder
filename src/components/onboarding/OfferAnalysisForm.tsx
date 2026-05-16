"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  OfferFormData,
  OfferFormat,
  TrafficChannel,
  CurrencyCode,
} from "@/lib/offer-types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const offerFormatOptions: OfferFormat[] = [
  "course", "coaching", "ebook", "saas", "physical",
  "membership", "agency", "consulting", "affiliate", "local",
];

const currencyOptions: CurrencyCode[] = [
  "USD", "GBP", "EUR", "AUD", "CAD", "NZD", "ZAR", "INR", "NGN", "GHS",
];

const trafficChannels: TrafficChannel[] = [
  "Meta Ads", "Google Ads", "YouTube Ads", "TikTok Ads", "LinkedIn Ads",
  "Email List", "Organic Social", "SEO / Blog", "Podcast", "Haven't started yet",
];

interface OfferAnalysisFormProps {
  formData: OfferFormData;
  setFormData: (data: OfferFormData) => void;
  selectedChannels: TrafficChannel[];
  handleChannelToggle: (channel: TrafficChannel) => void;
  errors: Record<string, string>;
  onSubmit: () => void;
  isSubmitting: boolean;
  onFillDemo: () => void;
}

const selectCls =
  "w-full bg-white/[0.12] border border-white/10 rounded-lg px-4 h-12 text-base text-white focus:outline-none focus:border-white transition-all appearance-none cursor-pointer placeholder:text-white/40";

const labelCls =
  "block text-base font-medium text-white mb-2";

export function OfferAnalysisForm({
  formData,
  setFormData,
  selectedChannels,
  handleChannelToggle,
  errors,
  onSubmit,
  isSubmitting,
  onFillDemo,
}: OfferAnalysisFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[720px] mx-auto"
    >
      <div className="relative group/container">
        {/* Gallereee Background Container */}
        <div className="absolute inset-0 bg-white/[0.08] backdrop-blur-[5px] rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] -z-10 transition-all duration-500" />

        <div className="px-8 py-12 md:px-12">

          {/* ── Page header ── */}
          <div className="flex items-start justify-between mb-10">
            <div>
              <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">
                Tell us about your offer
              </h1>
              <p className="text-[14px] text-white/50 mt-2 max-w-sm">
                Provide the core details of your product or service to begin the analysis.
              </p>
            </div>
            <button
              type="button"
              onClick={onFillDemo}
              className="mt-1 px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-[11px] font-semibold text-white/50 hover:text-white hover:border-white/20 transition-colors whitespace-nowrap"
            >
              Fill Demo Data
            </button>
          </div>

          {/* ── Form fields ── */}
          <div className="space-y-5">

            {/* Name + Format */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Product / Service Name *</label>
                <Input
                  value={formData.field_1_name}
                  onChange={(e) => setFormData({ ...formData, field_1_name: e.target.value })}
                  placeholder="e.g., Social Media Growth Course"
                />
                {errors.field_1_name && <Err msg={errors.field_1_name} />}
              </div>

              <div>
                <label className={labelCls}>Offer Format *</label>
                <div className="relative">
                  <select
                    className={selectCls}
                    value={formData.field_1_format}
                    onChange={(e) =>
                      setFormData({ ...formData, field_1_format: e.target.value as OfferFormat })
                    }
                  >
                    {offerFormatOptions.map((f) => (
                      <option key={f} value={f} className="bg-[#1a1a1a]">
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </option>
                    ))}
                  </select>
                  <Chevron />
                </div>
                {errors.field_1_format && <Err msg={errors.field_1_format} />}
              </div>
            </div>

            {/* Customer outcome */}
            <div>
              <label className={labelCls}>What does it do for your customer? *</label>
              <Textarea
                rows={4}
                value={formData.field_2_outcome}
                onChange={(e) => setFormData({ ...formData, field_2_outcome: e.target.value })}
                placeholder="e.g., Helps Nigerian entrepreneurs get 10+ leads a week from Instagram without paying for ads"
              />
              {errors.field_2_outcome && <Err msg={errors.field_2_outcome} />}
            </div>

            {/* Ideal customer */}
            <div>
              <label className={labelCls}>Ideal Customer Description *</label>
              <Input
                value={formData.field_3_persona}
                onChange={(e) => setFormData({ ...formData, field_3_persona: e.target.value })}
                placeholder="e.g., Female entrepreneurs aged 28–42 running online boutiques"
              />
              {errors.field_3_persona && <Err msg={errors.field_3_persona} />}
            </div>

            {/* Price + Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Price *</label>
                <Input
                  value={formData.field_4_price}
                  onChange={(e) => setFormData({ ...formData, field_4_price: e.target.value })}
                  placeholder="e.g., 97 or 29/month"
                />
                {errors.field_4_price && <Err msg={errors.field_4_price} />}
              </div>

              <div>
                <label className={labelCls}>Currency *</label>
                <div className="relative">
                  <select
                    className={selectCls}
                    value={formData.field_4_currency}
                    onChange={(e) =>
                      setFormData({ ...formData, field_4_currency: e.target.value as CurrencyCode })
                    }
                  >
                    {currencyOptions.map((c) => (
                      <option key={c} value={c} className="bg-[#0a0a0a]">
                        {c}
                      </option>
                    ))}
                  </select>
                  <Chevron />
                </div>
                {errors.field_4_currency && <Err msg={errors.field_4_currency} />}
              </div>
            </div>

            {/* Upsell */}
            <div>
              <label className={labelCls}>Premium Tier / Upsell (Optional)</label>
              <Input
                value={formData.field_4_upsell}
                onChange={(e) => setFormData({ ...formData, field_4_upsell: e.target.value })}
                placeholder="e.g., One-on-one coaching at $500/month"
              />
            </div>

            {/* Proof */}
            <div>
              <label className={labelCls}>Existing Proof / Credentials *</label>
              <Textarea
                rows={4}
                value={formData.field_5_proof}
                onChange={(e) => setFormData({ ...formData, field_5_proof: e.target.value })}
                placeholder="e.g., 5000+ Instagram followers, worked with 50+ clients, published on Medium, etc."
              />
              {errors.field_5_proof && <Err msg={errors.field_5_proof} />}
            </div>

            {/* Mechanism */}
            <div>
              <label className={labelCls}>Unique Mechanism / Method *</label>
              <Textarea
                rows={4}
                value={formData.field_6_mechanism}
                onChange={(e) => setFormData({ ...formData, field_6_mechanism: e.target.value })}
                placeholder="e.g., Our proprietary 7-step 'Content to Cash' framework"
              />
              {errors.field_6_mechanism && <Err msg={errors.field_6_mechanism} />}
            </div>

            {/* Traffic channels */}
            <div>
              <label className={labelCls}>Traffic Channels *</label>
              <div className="flex flex-wrap gap-2">
                {trafficChannels.map((channel) => (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => handleChannelToggle(channel)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-medium border transition-all",
                      selectedChannels.includes(channel)
                        ? "bg-white text-black border-white"
                        : "bg-white/5 border-white/10 text-white/50 hover:border-white/20 hover:text-white"
                    )}
                  >
                    {channel}
                  </button>
                ))}
              </div>
              {errors.field_7_channels && <Err msg={errors.field_7_channels} />}
            </div>

            {/* How do you get customers */}
            <div>
              <label className={labelCls}>How do you currently get customers? *</label>
              <Textarea
                rows={4}
                value={formData.field_7_detail}
                onChange={(e) => setFormData({ ...formData, field_7_detail: e.target.value })}
                placeholder="e.g., Primarily through Instagram Reels and a weekly newsletter"
              />
              {errors.field_7_detail && <Err msg={errors.field_7_detail} />}
            </div>

            {/* Primary challenge */}
            <div>
              <label className={labelCls}>Primary Challenge *</label>
              <Textarea
                rows={4}
                value={formData.field_8_challenge}
                onChange={(e) => setFormData({ ...formData, field_8_challenge: e.target.value })}
                placeholder="e.g., Scaling past $5k/month without increasing ad spend"
              />
              {errors.field_8_challenge && <Err msg={errors.field_8_challenge} />}
            </div>

            {/* ── Submit button — brand-yellow preserved ── */}
            <div className="pt-4 pb-8">
              <button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting}
                className="w-full h-14 rounded-full bg-white text-black font-bold text-[15px] tracking-wide hover:bg-zinc-200 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
              >
                {isSubmitting ? "Processing..." : "Continue to Analysis"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Micro-components ── */

function Err({ msg }: { msg: string }) {
  return <p className="text-xs text-red-400 mt-1.5">{msg}</p>;
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