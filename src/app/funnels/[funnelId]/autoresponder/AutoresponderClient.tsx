"use client";

import { useState } from "react";
import { toast } from "sonner";
import { saveIntegrations } from "../integrations/actions";
import { Webhook } from "lucide-react";

interface Props {
  funnelId: string;
  initialMakeUrl: string;
  initialZapierUrl: string;
  initialCheckoutUrls: Record<string, string>;
}

export function AutoresponderClient({ funnelId, initialMakeUrl, initialZapierUrl, initialCheckoutUrls }: Props) {
  const [makeUrl, setMakeUrl] = useState(initialMakeUrl);
  const [zapierUrl, setZapierUrl] = useState(initialZapierUrl);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      await saveIntegrations(funnelId, makeUrl, zapierUrl, initialCheckoutUrls);
      toast.success("Autoresponder settings saved successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to save autoresponder settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#131826] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 via-transparent to-brand-indigo/5 opacity-50" />

        <div className="p-8 relative z-10 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-brand-blue/20 to-brand-indigo/20 border border-brand-blue/20">
              <Webhook className="w-5 h-5 text-brand-blue" />
            </div>
            <h2 className="text-2xl font-black text-white">Autoresponder Integrations</h2>
          </div>
          <p className="text-sm text-white/50 mt-2">
            Connect your funnel to external autoresponders. When a lead is captured, we will send an HTTP POST request with the lead data to these Webhook URLs.
          </p>
        </div>

        <div className="p-8 relative z-10 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-bold text-white block">Make.com Webhook URL</label>
            <input
              type="url"
              placeholder="https://hook.us1.make.com/..."
              value={makeUrl}
              onChange={(e) => setMakeUrl(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/50 transition-all"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-white block">Zapier Webhook URL</label>
            <input
              type="url"
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              value={zapierUrl}
              onChange={(e) => setZapierUrl(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/50 transition-all"
            />
          </div>
        </div>

        <div className="p-6 bg-black/20 border-t border-white/10 relative z-10 flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-brand-blue to-brand-indigo hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
