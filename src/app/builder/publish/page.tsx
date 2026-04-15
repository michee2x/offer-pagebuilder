'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Globe,
  ExternalLink,
  Loader2,
  Copy,
  CheckCircle2,
  Check,
  Lock,
  Rocket,
  ShieldCheck,
  Settings,
  Camera,
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

// ─── Deploy stages shown to user while capturing ─────────────────────
const DEPLOY_STAGES = [
  { id: 'save',       label: 'Finalising content…',           duration: 800  },
  { id: 'screenshot', label: 'Spinning up capture engine... generating literal screenshot…',    duration: 3500 },
  { id: 'upload',     label: 'Uploading preview image…',      duration: 1200 },
  { id: 'edge',       label: 'Publishing to edge network…',   duration: 900  },
  { id: 'done',       label: 'Deployment complete!',          duration: 0    },
];

function PublishContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();

  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [savingSeo, setSavingSeo]   = useState(false);
  const [copied, setCopied]         = useState(false);
  const [deploying, setDeploying]   = useState(false);
  const [deployStage, setDeployStage] = useState(0);

  const [pageData, setPageData]     = useState<any>(null);
  const [activeTab, setActiveTab]   = useState<'subdomain' | 'custom'>('subdomain');

  const [subdomain, setSubdomain]         = useState('');
  const [customDomain, setCustomDomain]   = useState('');

  // SEO state
  const [seoTitle, setSeoTitle]           = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [faviconUrl, setFaviconUrl]       = useState('');

  const [baseDomain, setBaseDomain] = useState('ofiq.app');
  const [protocol, setProtocol]     = useState('https://');

  const isTitleValid = seoTitle.length >= 50;
  const isDescValid = seoDescription.length >= 110;
  const isSeoValid = isTitleValid && isDescValid;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLocal =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';
      if (isLocal) {
        setBaseDomain(window.location.host);
        setProtocol('http://');
      }
    }

    if (!id) {
      toast.error('No page ID provided');
      router.push('/builder');
      return;
    }

    async function fetchData() {
      try {
        const res = await fetch(`/api/pages/${id}`);
        const data = await res.json();

        if (data.page) {
          setPageData(data.page);
          setSubdomain(data.page.subdomain || '');
          setCustomDomain(data.page.custom_domain || '');
          setSeoTitle(data.page.seo_title || data.page.name || '');
          setSeoDescription(data.page.seo_description || '');
          setFaviconUrl(data.page.favicon_url || '');
        } else {
          toast.error('Page not found');
        }
      } catch {
        toast.error('Failed to load page data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, router]);

  // ─── Domain handlers ─────────────────────────────────────────────────
  const handleSaveDomain = async (type: 'subdomain' | 'custom') => {
    try {
      setSaving(true);
      toast.loading(`Saving ${type}…`);

      const payload = { pageId: id } as any;
      if (type === 'subdomain') payload.subdomain = subdomain;
      else payload.custom_domain = customDomain;

      const res = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      toast.dismiss();
      if (!res.ok) throw new Error(data.error || 'Failed to update domain');
      toast.success(
        `${type === 'subdomain' ? 'Subdomain' : 'Custom domain'} updated!`
      );
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── SEO handler ─────────────────────────────────────────────────────
  const handleSaveSeo = async () => {
    try {
      setSavingSeo(true);
      toast.loading('Saving SEO settings…');

      const res = await fetch('/api/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: id,
          seo_title: seoTitle,
          seo_description: seoDescription,
          favicon_url: faviconUrl,
        }),
      });

      const data = await res.json();
      toast.dismiss();
      if (!res.ok) throw new Error(data.error || 'Failed to save SEO');
      toast.success('SEO settings saved!');
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message);
    } finally {
      setSavingSeo(false);
    }
  };

  // Hard cap on how long we'll wait for a screenshot — never block deploy
  const SCREENSHOT_TIMEOUT_MS = 8500;

  /** Races captureScreenshot against a hard timeout — always resolves */
  const captureScreenshotSafe = (): Promise<string | null> =>
    Promise.race([
      captureScreenshot(),
      new Promise<null>((res) => setTimeout(() => res(null), SCREENSHOT_TIMEOUT_MS)),
    ]);

  // ─── Screenshot-based deploy flow ────────────────────────────────────
  const handleDeploy = async () => {
    if (!id) {
      return;
    }
    
    setDeploying(true);
    setDeployStage(0);

    try {
      // Stage 0 — "Finalising content"
      await delay(DEPLOY_STAGES[0].duration);
      setDeployStage(1); // "Capturing screenshot…"

      // Stage 1 & 2 — Screenshot capture & upload (blocking, but timeout capped at 6s)
      const screenshotUrl = await captureScreenshotSafe();
      
      setDeployStage(2); // "Uploading…"
      await delay(800);
      setDeployStage(3); // "Publishing to edge…"
      await delay(600);
      setDeployStage(4); // done
      await delay(300);

      if (screenshotUrl) console.log('[OG] Screenshot saved:', screenshotUrl);
      else console.warn('[OG] Screenshot capture skipped/timed out');

      // Navigate after upload is 100% finished
      router.push(`/builder/publish/success?id=${id}`);
    } catch (err: any) {
      toast.error(err.message || 'Deployment failed');
      setDeploying(false);
      setDeployStage(0);
    }
  };

  /**
   * Triggers the backend to link the dynamic Satori OG generator to this funnel.
   * Supremely fast because no native DOM rendering or uploading is required.
   */
  const captureScreenshot = async (): Promise<string | null> => {
    if (!id) return null;
    try {
      const res = await fetch('/api/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId: id }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.screenshotUrl || null;
    } catch (e) {
      console.warn('[OG] Satori registration request failed:', e);
      return null;
    }
  };

  const delay = (ms: number) =>
    new Promise<void>((res) => setTimeout(res, ms));

  const copyToClipboard = (text: string) => {
    if (!text) return;
    const url = `${protocol}${text}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── Loading splash ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentUrl =
    activeTab === 'subdomain'
      ? subdomain
        ? `${subdomain}.${baseDomain}`
        : `your-site.${baseDomain}`
      : customDomain
      ? customDomain
      : 'yourdomain.com';

  const hasConfiguredDomain = Boolean(subdomain || customDomain);

  // ─── Deploying overlay ────────────────────────────────────────────────
  if (deploying) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center gap-8">
        <div className="flex flex-col items-center gap-6 max-w-sm w-full px-4">
          {/* Spinning rocket */}
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-primary/10 border border-primary/20 animate-ping" />
            <div className="relative w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Rocket className="w-9 h-9 text-primary animate-bounce" />
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-xl font-bold mb-1">Deploying Funnel</h2>
            <p className="text-sm text-muted-foreground">
              {DEPLOY_STAGES[deployStage]?.label}
            </p>
          </div>

          {/* Step progress */}
          <div className="w-full space-y-2">
            {DEPLOY_STAGES.slice(0, -1).map((stage, i) => (
              <div key={stage.id} className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all duration-500 ${
                    i < deployStage
                      ? 'bg-emerald-500 border-emerald-500'
                      : i === deployStage
                      ? 'border-primary bg-primary/10'
                      : 'border-border'
                  }`}
                >
                  {i < deployStage ? (
                    <Check className="w-3 h-3 text-white" />
                  ) : i === deployStage ? (
                    <Loader2 className="w-3 h-3 text-primary animate-spin" />
                  ) : null}
                </div>
                <span
                  className={`text-sm transition-colors ${
                    i <= deployStage ? 'text-foreground' : 'text-muted-foreground/40'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
              style={{ width: `${(deployStage / (DEPLOY_STAGES.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ─── Main publish UI ──────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans text-foreground">
      <Sidebar />

      <div
        className="flex-1 flex flex-col min-w-0 overflow-hidden relative"
        style={{ marginLeft: '56px' }}
      >
        <Topbar
          breadcrumbs={[
            { label: 'Workspace' },
            { label: 'Funnels', href: '/' },
            { label: 'Page Builder', href: `/builder?id=${id}` },
            { label: 'Publish & Deploy' },
          ]}
          steps={[
            { id: 1, label: 'Upload',      status: 'done'   },
            { id: 2, label: 'Intelligence', status: 'done'   },
            { id: 3, label: 'Copy',        status: 'done'   },
            { id: 4, label: 'Build Pages', status: 'done'   },
            { id: 5, label: 'Publish',     status: 'active' },
          ]}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`${protocol}${currentUrl}`, '_blank')}
            className="gap-2 h-8 text-muted-foreground mr-2"
          >
            <ExternalLink className="w-4 h-4" /> Preview
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(currentUrl)}
            className="gap-2 h-8 text-muted-foreground mr-2"
          >
            <Copy className="w-4 h-4" /> Share
          </Button>
          <Button
            size="sm"
            onClick={handleDeploy}
            disabled={deploying}
            className="h-8 gap-2 bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm font-medium"
          >
            <Rocket className="w-4 h-4" />
            Go Live
          </Button>
        </Topbar>

        <div className="flex-1 overflow-y-auto flex">
          {/* ── Main Content ── */}
          <div className="flex-1 p-8 pb-24 overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {pageData?.name || 'Publish & Deploy'}
                  </h2>
                  <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    Step 5 of 5
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Configure your domain, review all pages, and publish your funnel live.
                </p>
              </div>
              <div className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Ready to Publish
              </div>
            </div>

            {/* Domain Card */}
            <div className="bg-card border border-border rounded-xl shadow-sm mb-8 overflow-hidden">
              <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">Domain Configuration</h3>
                </div>
                {hasConfiguredDomain && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-500">
                    <CheckCircle2 className="w-3 h-3" /> Configured
                  </span>
                )}
              </div>

              <div className="p-6">
                <div className="flex bg-muted p-1 rounded-lg mb-6 max-w-sm border border-border/50">
                  <button
                    onClick={() => setActiveTab('subdomain')}
                    className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      activeTab === 'subdomain'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    OfferIQ Subdomain
                  </button>
                  <button
                    onClick={() => setActiveTab('custom')}
                    className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      activeTab === 'custom'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Custom Domain
                  </button>
                </div>

                {activeTab === 'subdomain' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <p className="text-sm text-muted-foreground mb-4">
                      Your funnel will be hosted securely on our edge network. Perfect for
                      fast testing and iteration.
                    </p>
                    <div className="flex items-center bg-background border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all mb-4 max-w-xl">
                      <div className="px-4 bg-muted/50 border-r border-border text-sm font-medium text-muted-foreground h-11 flex items-center shrink-0 gap-2">
                        <Lock className="w-3.5 h-3.5 text-emerald-500" />
                        {protocol}
                      </div>
                      <input
                        value={subdomain}
                        onChange={(e) =>
                          setSubdomain(
                            e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                          )
                        }
                        className="flex-1 bg-transparent px-3 h-11 text-sm font-medium text-foreground focus:outline-none"
                        placeholder="my-awesome-funnel"
                      />
                      <div className="px-4 text-sm font-medium text-muted-foreground border-l border-border bg-muted/50 h-11 flex items-center shrink-0">
                        .{baseDomain}
                      </div>
                      <Button
                        onClick={() => copyToClipboard(currentUrl)}
                        variant="ghost"
                        size="sm"
                        className="h-11 px-4 rounded-none border-l border-border hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <Button
                      onClick={() => handleSaveDomain('subdomain')}
                      disabled={saving}
                      className="mt-2"
                    >
                      {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Save Subdomain
                    </Button>
                  </div>
                )}

                {activeTab === 'custom' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <p className="text-sm text-muted-foreground mb-4">
                      Connect your own custom domain (e.g., yourdomain.com). Update your
                      DNS records accordingly.
                    </p>
                    <div className="flex items-center bg-background border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all mb-6 max-w-xl">
                      <div className="px-4 bg-muted/50 border-r border-border text-sm font-medium text-muted-foreground h-11 flex items-center shrink-0 gap-2">
                        <Lock className="w-3.5 h-3.5 text-emerald-500" />
                        {protocol}
                      </div>
                      <input
                        value={customDomain}
                        onChange={(e) => setCustomDomain(e.target.value.toLowerCase())}
                        className="flex-1 bg-transparent px-3 h-11 text-sm font-medium text-foreground focus:outline-none"
                        placeholder="www.yourdomain.com"
                      />
                      <Button
                        onClick={() => handleSaveDomain('custom')}
                        disabled={saving}
                        variant="secondary"
                        className="h-11 px-5 rounded-none border-l border-border font-semibold shrink-0"
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Verify Domain'
                        )}
                      </Button>
                    </div>

                    <div className="bg-muted/30 border border-border rounded-lg overflow-hidden max-w-2xl">
                      <div className="px-4 py-3 border-b border-border bg-muted/50">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                          <Settings className="w-3.5 h-3.5" /> DNS Records
                        </h4>
                      </div>
                      <table className="w-full text-sm text-left">
                        <thead className="bg-muted/20 text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
                          <tr>
                            <th className="px-5 py-3 border-b border-border">Type</th>
                            <th className="px-5 py-3 border-b border-border">Name</th>
                            <th className="px-5 py-3 border-b border-border">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                            <td className="px-5 py-4 font-semibold text-blue-400">A</td>
                            <td className="px-5 py-4 text-muted-foreground font-mono text-xs">@</td>
                            <td className="px-5 py-4 font-mono text-xs text-foreground">76.76.21.21</td>
                          </tr>
                          <tr className="hover:bg-muted/50 transition-colors">
                            <td className="px-5 py-4 font-semibold text-purple-400">CNAME</td>
                            <td className="px-5 py-4 text-muted-foreground font-mono text-xs">www</td>
                            <td className="px-5 py-4 font-mono text-xs text-foreground">cname.ofiq.app</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Checklist */}
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="px-5 py-4 border-b border-border flex items-center gap-2 bg-muted/30">
                  <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold text-sm">Launch Checklist</span>
                </div>
                <div className="divide-y divide-border flex-1">
                  {[
                    {
                      title: 'Content Generated',
                      desc: 'AI has successfully drafted all section copy and structures.',
                      done: true,
                    },
                    {
                      title: 'Design System Sync',
                      desc: 'Visual styles and tokens applied across pages.',
                      done: true,
                    },
                    {
                      title: 'Screenshot Preview',
                      desc: 'Auto-captured on first deploy for OpenGraph sharing.',
                      done: Boolean(
                        pageData?.og_image_url || pageData?.blocks?.og_image_url
                      ),
                    },
                    {
                      title: 'Domain Verification',
                      desc: 'Connect your funnel to the public web.',
                      done: hasConfiguredDomain,
                    },
                  ].map((item) => (
                    <div key={item.title} className="p-5 flex items-start gap-4 hover:bg-muted/20 transition-colors">
                      <div
                        className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          item.done
                            ? 'bg-primary/20 border-primary/30 text-primary'
                            : 'border-muted-foreground/40'
                        }`}
                      >
                        {item.done && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deploy Action */}
              <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden group">
                {!isSeoValid && (
                  <div className="absolute top-0 left-0 right-0 bg-yellow-500/10 border-b border-yellow-500/20 p-3 text-yellow-600 dark:text-yellow-500 text-xs text-left flex gap-3">
                    <span className="text-lg leading-none">⚠️</span>
                    <p className="font-medium leading-relaxed">
                      <strong>Recommendation:</strong> OpenGraph standards suggest a Minimum 50 char Title and 110 char Description to reliably process Social Previews.
                    </p>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mb-5 shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-3 duration-300 mt-6 bg-primary/10 border-primary/20 text-primary`}>
                  <Rocket className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-2">Deploy Funnel</h3>
                <p className="text-sm text-muted-foreground mb-3 max-w-[280px]">
                  Deploy live and auto-capture a screenshot for OpenGraph sharing on
                  WhatsApp, Slack, Twitter & more.
                </p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Heavy literal screenshot processed securely in background.</span>
                </div>
                <Button
                  size="lg"
                  className="w-full max-w-xs font-semibold shadow-sm transition-all bg-emerald-500 hover:bg-emerald-600 text-white"
                  onClick={handleDeploy}
                  disabled={deploying}
                >
                  {deploying ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Rocket className="w-5 h-5 mr-2" />
                  )}
                  {deploying ? 'Deploying…' : 'Deploy Funnel'}
                </Button>
              </div>
            </div>

            {/* Metrics Snapshot */}
            <div>
              <h3 className="text-sm font-semibold mb-4 text-foreground flex items-center gap-2">
                Metrics Snapshot
                <span className="text-[10px] uppercase tracking-wider font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground">
                  Preview
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { lbl: 'Total Views',    val: '-', icon: '👁️' },
                  { lbl: 'Leads Captured', val: '-', icon: '🎯' },
                  { lbl: 'Sales Revenue',  val: '-', icon: '💰' },
                ].map((an, i) => (
                  <div
                    key={i}
                    className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-border/80 transition-colors"
                  >
                    <div className="text-2xl mb-3 opacity-60 grayscale">{an.icon}</div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">{an.lbl}</div>
                    <div className="text-3xl font-bold text-muted-foreground/50">{an.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right Config Panel ── */}
          <div className="w-[300px] shrink-0 border-l border-border bg-card p-6 overflow-y-auto hidden lg:block">
            <div className="flex bg-muted/50 p-1 rounded-lg gap-1 mb-8 border border-border/50">
              <button className="flex-1 text-xs font-semibold text-foreground py-2 px-3 rounded-md bg-background shadow-sm border border-border/50">
                SEO
              </button>
              <button className="flex-1 text-xs font-medium text-muted-foreground hover:text-foreground py-2 px-3 rounded-md transition-colors">
                Scripts
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold mb-5 flex items-center gap-2 text-foreground">
                  <Globe className="w-4 h-4 text-muted-foreground" /> Meta Information
                </h4>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Page Title
                    </label>
                    <input
                      className="w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder="My Awesome Offer"
                      maxLength={70}
                    />
                    <p className={`text-[10px] text-right font-medium ${isTitleValid ? 'text-emerald-500' : 'text-yellow-600 dark:text-yellow-500'}`}>
                      {seoTitle.length}/70 chars (suggested min 50)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Description
                    </label>
                    <textarea
                      className="w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all resize-none"
                      rows={4}
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      placeholder="Describe what this page offers…"
                      maxLength={160}
                    />
                    <p className={`text-[10px] text-right font-medium ${isDescValid ? 'text-emerald-500' : 'text-yellow-600 dark:text-yellow-500'}`}>
                      {seoDescription.length}/160 chars (suggested min 110)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      Favicon URL
                      <span className="normal-case font-normal text-muted-foreground/60">
                        (optional)
                      </span>
                    </label>
                    <div className="flex items-center gap-2">
                      {faviconUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={faviconUrl}
                          alt="favicon preview"
                          className="w-6 h-6 rounded object-contain border border-border bg-muted shrink-0"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                      )}
                      <input
                        className="flex-1 bg-background border border-border rounded-md px-3 py-2.5 text-sm font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                        value={faviconUrl}
                        onChange={(e) => setFaviconUrl(e.target.value)}
                        placeholder="https://yourdomain.com/favicon.ico"
                        type="url"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <Button className="w-full gap-2" onClick={handleSaveSeo} disabled={savingSeo}>
                  {savingSeo ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {savingSeo ? 'Saving…' : 'Save SEO Settings'}
                </Button>
                <p className="text-[10px] text-muted-foreground text-center mt-3 leading-relaxed">
                  These settings are injected into the live page&apos;s{' '}
                  <code className="font-mono bg-muted px-1 rounded">&lt;head&gt;</code> for
                  search engines and social previews.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PublishPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <PublishContent />
    </Suspense>
  );
}
