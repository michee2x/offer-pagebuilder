'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Globe, 
  ExternalLink, 
  Loader2, 
  ArrowLeft, 
  Copy, 
  CheckCircle2, 
  Check, 
  Lock,
  ArrowRight,
  Rocket,
  ShieldCheck,
  Settings
} from 'lucide-react';

export default function PublishPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [pageData, setPageData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'subdomain' | 'custom'>('subdomain');
  
  const [subdomain, setSubdomain] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  
  const [baseDomain, setBaseDomain] = useState('ofiq.app');
  const [protocol, setProtocol] = useState('https://');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
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
            } else {
                toast.error('Page not found');
            }
        } catch (err: any) {
            toast.error('Failed to load page data');
        } finally {
            setLoading(false);
        }
    }

    fetchData();
  }, [id, router]);

  const handleSaveDomain = async (type: 'subdomain' | 'custom') => {
    try {
        setSaving(true);
        toast.loading(`Saving ${type}...`);
        
        const payload = { pageId: id } as any;
        if (type === 'subdomain') {
            payload.subdomain = subdomain;
        } else {
            payload.custom_domain = customDomain;
        }

        const res = await fetch('/api/domains', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || 'Failed to update domain');
        }

        toast.dismiss();
        toast.success(`${type === 'subdomain' ? 'Subdomain' : 'Custom domain'} updated!`);
    } catch (err: any) {
        toast.dismiss();
        toast.error(err.message);
    } finally {
        setSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    const url = `${protocol}${text}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
      return (
          <div className="flex h-screen items-center justify-center bg-background">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
      );
  }

  const currentUrl = activeTab === 'subdomain' 
    ? (subdomain ? `${subdomain}.${baseDomain}` : `your-site.${baseDomain}`)
    : (customDomain ? customDomain : 'yourdomain.com');

  const hasConfiguredDomain = Boolean(subdomain || customDomain);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 font-sans">
      {/* Top Navigation */}
      <header className="h-14 border-b border-border bg-background flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/builder?id=${id}`)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Builder
          </Button>
          <div className="w-px h-6 bg-border" />
          <h1 className="font-semibold text-foreground tracking-tight">Deploying "{pageData?.name || 'Untitled Page'}"</h1>
        </div>
        <div className="flex items-center gap-3">
          {hasConfiguredDomain && (
            <Button variant="outline" size="sm" onClick={() => window.open(`${protocol}${currentUrl}`, '_blank')} className="gap-2">
              <ExternalLink className="w-4 h-4" /> Visit Live Site
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto mt-12 px-6">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/20 rounded-2xl p-8 mb-8 shadow-sm relative overflow-hidden">
            <div className="relative z-10 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-2 flex items-center gap-3 text-foreground">
                      Ready to Go Live <Rocket className="w-5 h-5 text-primary" />
                    </h2>
                    <p className="text-muted-foreground max-w-lg mt-1 text-sm leading-relaxed">
                        Configure your domain and publish your funnels instantly. We automatically provision free SSL certificates over our high-performance global CDN edge network.
                    </p>
                </div>
                <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center border border-border shrink-0">
                    <Globe className="w-8 h-8 text-primary" />
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Domain Selection */}
            <div className="md:col-span-2 space-y-6">
                
                {/* Domain Card */}
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/40">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground flex items-center gap-2 text-sm">
                              <Globe className="w-4 h-4 text-muted-foreground" />
                              Domain Setup
                            </span>
                        </div>
                        {hasConfiguredDomain && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                Live
                            </span>
                        )}
                    </div>
                    
                    <div className="p-6">
                        {/* Domain Tabs */}
                        <div className="flex bg-muted/50 p-1 rounded-lg mb-6 max-w-sm">
                            <button 
                                onClick={() => setActiveTab('subdomain')}
                                className={`flex-1 py-1.5 text-[13px] font-medium rounded-md transition-all ${activeTab === 'subdomain' ? 'bg-background text-foreground shadow-sm border border-border/50' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Subdomain
                            </button>
                            <button 
                                onClick={() => setActiveTab('custom')}
                                className={`flex-1 py-1.5 text-[13px] font-medium rounded-md transition-all ${activeTab === 'custom' ? 'bg-background text-foreground shadow-sm border border-border/50' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Custom Domain
                            </button>
                        </div>

                        {/* Subdomain Tab */}
                        {activeTab === 'subdomain' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <p className="text-[13px] text-muted-foreground">
                                    Your funnel is hosted securely on our network. Perfect for fast testing and iteration.
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 flex items-center bg-background border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                                        <div className="px-3 text-muted-foreground bg-muted/30 border-r border-border flex items-center h-full">
                                            <Lock className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                                            <span className="text-[13px] font-medium">{protocol}</span>
                                        </div>
                                        <input 
                                            value={subdomain}
                                            onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                            placeholder="my-funnel"
                                            className="flex-1 bg-transparent px-3 py-2.5 text-[13px] font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
                                        />
                                        <div className="px-3 text-[13px] font-medium text-muted-foreground bg-muted/30 h-full flex items-center border-l border-border">
                                            .{baseDomain}
                                        </div>
                                    </div>
                                    <Button onClick={() => copyToClipboard(currentUrl)} variant="ghost" size="icon" className="shrink-0 bg-muted/50">
                                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                                    </Button>
                                </div>
                                <div className="pt-2">
                                    <Button 
                                        onClick={() => handleSaveDomain('subdomain')} 
                                        disabled={saving}
                                        className="w-full"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                        Save Subdomain
                                    </Button>
                                </div>
                                
                                {subdomain && (
                                    <div className="mt-4 flex items-start gap-4 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                                        <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                                        <div>
                                            <h4 className="text-[13px] font-semibold text-emerald-500">SSL Certificate Automatically Provisioned</h4>
                                            <p className="text-xs text-muted-foreground mt-1">Managed certificate via Let's Encrypt • Renews automatically</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Custom Domain Tab */}
                        {activeTab === 'custom' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <p className="text-[13px] text-muted-foreground">
                                    Use your own domain name (e.g., yourdomain.com). Point your DNS records using the details below.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <div className="flex-1 flex items-center bg-background border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                                        <div className="px-3 text-muted-foreground bg-muted/30 border-r border-border flex items-center h-full">
                                            <Lock className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                                            <span className="text-[13px] font-medium">{protocol}</span>
                                        </div>
                                        <input 
                                            value={customDomain}
                                            onChange={(e) => setCustomDomain(e.target.value.toLowerCase())}
                                            placeholder="www.yourdomain.com"
                                            className="flex-1 bg-transparent px-3 py-2.5 text-[13px] font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
                                        />
                                    </div>
                                    <Button 
                                        onClick={() => handleSaveDomain('custom')} 
                                        disabled={saving}
                                        className="w-full"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                        Connect Domain
                                    </Button>
                                </div>

                                {customDomain && (
                                    <div className="mt-6 border-t border-border pt-5">
                                        <h4 className="text-[13px] font-semibold text-foreground mb-3 flex items-center gap-2">
                                          <Settings className="w-4 h-4 text-muted-foreground" /> DNS Configuration
                                        </h4>
                                        <p className="text-[12px] text-muted-foreground mb-4">Add the following DNS records in your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):</p>
                                        
                                        <div className="bg-background rounded-md border border-border overflow-hidden font-mono text-xs leading-relaxed">
                                            <table className="w-full text-left">
                                                <thead className="bg-muted/40 text-muted-foreground text-[11px] uppercase tracking-wider">
                                                    <tr>
                                                        <th className="py-2.5 px-4 font-semibold">Type</th>
                                                        <th className="py-2.5 px-4 font-semibold">Name</th>
                                                        <th className="py-2.5 px-4 font-semibold text-right">Value</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-foreground">
                                                    <tr className="border-t border-border/50">
                                                        <td className="py-3 px-4 text-primary font-medium">A</td>
                                                        <td className="py-3 px-4">@</td>
                                                        <td className="py-3 px-4 text-right">76.76.21.21</td>
                                                    </tr>
                                                    <tr className="border-t border-border/50">
                                                        <td className="py-3 px-4 text-blue-500 font-medium">CNAME</td>
                                                        <td className="py-3 px-4">www</td>
                                                        <td className="py-3 px-4 text-right">cname.ofiq.app</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Right Column: Pre-launch Checklist */}
            <div className="md:col-span-1">
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden sticky top-20">
                    <div className="px-5 py-4 border-b border-border bg-muted/40">
                        <span className="font-semibold text-foreground text-[13px] tracking-tight">Deploy Checklist</span>
                    </div>
                    <div className="p-0">
                        <ul className="divide-y divide-border text-[13px]">
                            <li className="p-4 flex gap-3 hover:bg-muted/30 transition-colors">
                                <div className="mt-0.5"><CheckCircle2 className="w-4 h-4 text-primary" /></div>
                                <div>
                                    <span className="block font-medium text-foreground">Content Drafted</span>
                                    <p className="text-[11px] text-muted-foreground mt-1">Page builder sections saved</p>
                                </div>
                            </li>
                            <li className="p-4 flex gap-3 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => document.querySelector('input')?.focus()}>
                                <div className="mt-0.5"><div className={`w-4 h-4 rounded-full border-[1.5px] ${hasConfiguredDomain ? 'bg-primary border-none' : 'border-muted-foreground/40'} flex items-center justify-center`}>{hasConfiguredDomain && <Check className="w-3 h-3 text-primary-foreground" />}</div></div>
                                <div>
                                    <span className="block font-medium text-foreground">Configure Domain</span>
                                    <p className="text-[11px] text-muted-foreground mt-1">Route traffic to your page</p>
                                </div>
                            </li>
                            <li className="p-4 flex gap-3 hover:bg-muted/30 transition-colors">
                                <div className="mt-0.5"><div className="w-4 h-4 rounded-full border-[1.5px] border-muted-foreground/40" /></div>
                                <div>
                                    <span className="block font-medium text-foreground">Add Custom Scripts</span>
                                    <p className="text-[11px] text-muted-foreground mt-1">Tracking via Analytics & Meta Pixel</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className="p-4 bg-muted/40 border-t border-border flex flex-col gap-3">
                       <Button 
                         disabled={!hasConfiguredDomain} 
                         onClick={() => window.open(`${protocol}${currentUrl}`, '_blank')}
                         className="w-full gap-2 transition-all"
                       >
                         View Live Page <ArrowRight className="w-4 h-4" />
                       </Button>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}

