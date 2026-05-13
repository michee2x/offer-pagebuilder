"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CheckCircle } from "lucide-react";

export default function SalesIntelligencePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const workspaceId = searchParams.get("workspace");
  const offerSlug = searchParams.get("offer");

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      }
      if (!workspaceId || !offerSlug) {
        router.push("/");
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [router, supabase, workspaceId, offerSlug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07080F] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080F] text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-8"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-400/20 text-green-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <CheckCircle className="h-4 w-4" />
            Analysis Complete
          </div>
          <h1 className="text-4xl font-bold mb-4 tracking-tighter">
            Your Sales Intelligence
          </h1>
          <p className="text-slate-400 text-lg">
            Here&apos;s what we discovered about your offer&apos;s potential
          </p>
        </div>

        <div className="space-y-8">
          {/* Offer Score */}
          <div className="bg-slate-800/50 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Offer Viability Score</h2>
            <div className="text-center">
              <div className="text-6xl font-bold text-orange-400 mb-2">
                78/100
              </div>
              <p className="text-slate-400">
                Strong potential with room for optimization
              </p>
            </div>
          </div>

          {/* Key Insights */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-green-400">
                Strengths
              </h3>
              <ul className="space-y-2 text-slate-300">
                <li>• High demand in your target market</li>
                <li>• Clear value proposition</li>
                <li>• Competitive pricing strategy</li>
              </ul>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-amber-400">
                Opportunities
              </h3>
              <ul className="space-y-2 text-slate-300">
                <li>• Expand to adjacent markets</li>
                <li>• Add complementary services</li>
                <li>• Implement referral program</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-slate-800/50 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6">
              Ready to Build Your System?
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Button
                onClick={() =>
                  router.push(
                    `/workspaces/${workspaceId}/builder?offer=${offerSlug}`,
                  )
                }
                className="bg-orange-500 hover:bg-orange-600 text-black font-semibold py-3"
              >
                Create Landing Page
              </Button>
              <Button
                onClick={() =>
                  router.push(
                    `/workspaces/${workspaceId}/copy?offer=${offerSlug}`,
                  )
                }
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-700 py-3"
              >
                Generate Sales Copy
              </Button>
              <Button
                onClick={() =>
                  router.push(
                    `/workspaces/${workspaceId}/funnels?offer=${offerSlug}`,
                  )
                }
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-700 py-3"
              >
                Build Funnel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
