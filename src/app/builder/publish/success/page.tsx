'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, ExternalLink, Globe, ArrowLeft, CheckCircle2, Zap, Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export default function DeploymentSuccessPage() {
  const searchParams = useSearchParams();
  const pageId = searchParams.get('id');
  const router = useRouter();

  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    if (!pageId) {
      router.push('/');
      return;
    }

    // Confetti burst on mount — gives the Vercel "congrats" feel
    const timer = setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#f5a623', '#ffffff', '#22c55e', '#a855f7'],
      });
    }, 300);

    fetch(`/api/pages/${pageId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.page) setPageData(data.page);
        else router.push('/');
      })
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));

    return () => clearTimeout(timer);
  }, [pageId, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
      </div>
    );
  }

  // Resolve the deployed URL
  const isLocal =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const proto = isLocal ? 'http://' : 'https://';
  const baseDomain = isLocal ? (typeof window !== 'undefined' ? window.location.host : 'localhost:3000') : 'ofiq.app';

  let liveUrl = '';
  if (pageData?.custom_domain) {
    liveUrl = `https://${pageData.custom_domain}`;
  } else if (pageData?.subdomain) {
    liveUrl = `${proto}${pageData.subdomain}.${baseDomain}`;
  } else {
    liveUrl = `${proto}${baseDomain}/p/${pageId}`;
  }

  // Screenshot: use the literal uploaded screenshot URL from the bucket
  const screenshotUrl =
    pageData?.og_image_url ||
    pageData?.blocks?.og_image_url ||
    null;

  const handleCopy = () => {
    navigator.clipboard.writeText(liveUrl);
    setCopied(true);
    toast.success('URL copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      {/* Card */}
      <div className="w-full max-w-[560px] bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-7 pt-7 pb-5">
          <h1 className="text-2xl font-bold tracking-tight mb-1.5">Congratulations! 🎉</h1>
          <p className="text-sm text-white/60">
            You just deployed{' '}
            <span className="text-white font-semibold">
              {pageData?.name || 'your funnel'}
            </span>{' '}
            to the live web.
          </p>
        </div>

        {/* Screenshot preview — the main visual showcase */}
        <div className="mx-5 mb-5 rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0a] aspect-[16/9] relative">
          {screenshotUrl ? (
            <>
              {/* Skeleton shimmer while image loads */}
              {!imgLoaded && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#111] via-[#1a1a1a] to-[#111] animate-pulse" />
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={screenshotUrl}
                alt="Funnel preview"
                className={`w-full h-full object-cover object-top transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImgLoaded(true)}
              />
            </>
          ) : (
            /* No screenshot yet — animated placeholder */
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Globe className="w-6 h-6 text-white/30" />
              </div>
              <p className="text-xs text-white/30">Preview generating…</p>
            </div>
          )}

          {/* Live badge overlay */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm border border-white/10 rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-white/80">Live</span>
          </div>
        </div>

        {/* Live URL row */}
        <div className="mx-5 mb-5 flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5">
          <Globe className="w-3.5 h-3.5 text-white/40 shrink-0" />
          <span className="flex-1 text-xs font-mono text-white/70 truncate">{liveUrl}</span>
          <button
            onClick={handleCopy}
            className="shrink-0 p-1.5 rounded-md hover:bg-white/10 transition-colors text-white/50 hover:text-white"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 p-1.5 rounded-md hover:bg-white/10 transition-colors text-white/50 hover:text-white"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Next Steps */}
        <div className="px-7 pb-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-3">Next Steps</p>
          <div className="space-y-2">
            <button
              onClick={() => router.push(`/builder/publish?id=${pageId}`)}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-primary/30">
                <Globe className="w-4 h-4 text-white/40" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white/90">Add Custom Domain</p>
                <p className="text-xs text-white/40">Connect your own domain to this funnel</p>
              </div>
              <span className="text-white/20 group-hover:text-white/50 transition-colors">→</span>
            </button>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: pageData?.name || 'My Funnel', url: liveUrl });
                } else {
                  handleCopy();
                }
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-primary/30">
                <Share2 className="w-4 h-4 text-white/40" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white/90">Share Funnel</p>
                <p className="text-xs text-white/40">Send the link to your audience</p>
              </div>
              <span className="text-white/20 group-hover:text-white/50 transition-colors">→</span>
            </button>

            <button
              onClick={() => router.push(`/builder?id=${pageId}`)}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-primary/30">
                <Zap className="w-4 h-4 text-white/40" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white/90">Keep Editing</p>
                <p className="text-xs text-white/40">Go back to the builder and refine</p>
              </div>
              <span className="text-white/20 group-hover:text-white/50 transition-colors">→</span>
            </button>
          </div>
        </div>

        {/* CTA footer */}
        <div className="px-5 pb-6">
          <Button
            className="w-full h-11 bg-white text-black hover:bg-white/90 font-semibold text-sm"
            onClick={() => router.push('/')}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Continue to Dashboard
          </Button>
        </div>
      </div>

      {/* Back link */}
      <button
        onClick={() => router.push('/')}
        className="mt-5 flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to all funnels
      </button>
    </div>
  );
}
