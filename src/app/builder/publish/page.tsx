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
  Settings,
  X,
  Plus
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

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
  Settings,
  X,
  Plus
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

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
    <div className="flex h-screen overflow-hidden bg-background font-sans text-foreground">
      <Sidebar />
      {/* ml offset for fixed sidebar icon strip */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative" style={{ marginLeft: '56px' }}>
        <Topbar 
          breadcrumbs={[
              { label: 'Workspace' },
              { label: 'Funnels', href: '/' },
              { label: 'Page Builder', href: `/builder?id=${id}` },
              { label: 'Publish & Deploy' }
          ]}
          steps={[
              { id: 1, label: 'Upload', status: 'done' },
              { id: 2, label: 'Intelligence', status: 'done' },
              { id: 3, label: 'Copy', status: 'done' },
              { id: 4, label: 'Build Pages', status: 'done' },
              { id: 5, label: 'Publish', status: 'active' },
          ]}
        >
          <Button variant="ghost" size="sm" onClick={() => window.open(`${protocol}${currentUrl}`, '_blank')} className="gap-2 h-8 text-muted-foreground mr-2">
            <ExternalLink className="w-4 h-4" /> Preview
          </Button>
          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(currentUrl)} className="gap-2 h-8 text-muted-foreground mr-2">
            <Copy className="w-4 h-4" /> Share
          </Button>
          <Button 
            size="sm" 
            onClick={() => handleSaveDomain(activeTab)}
            className="h-8 gap-2 bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm font-medium"
          >
            <Rocket className="w-4 h-4" />
            Go Live
          </Button>
        </Topbar>

        <div className="flex-1 overflow-y-auto flex">
          {/* Main Content Column */}
          <div className="flex-1 p-8 pb-24 overflow-y-auto">
            
            {/* Header section */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-semibold tracking-tight">{pageData?.name || 'Publish & Deploy'}</h2>
                  <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    Step 5 of 5
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Configure your domain, review all pages, and publish your funnel live.</p>
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
                    className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'subdomain' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    OfferIQ Subdomain
                  </button>
                  <button 
                    onClick={() => setActiveTab('custom')}
                    className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'custom' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Custom Domain
                  </button>
                </div>

                {activeTab === 'subdomain' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <p className="text-sm text-muted-foreground mb-4">
                      Your funnel will be hosted securely on our edge network. Perfect for fast testing and iteration.
                    </p>
                    <div className="flex items-center bg-background border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all mb-4 max-w-xl">
                      <div className="px-4 bg-muted/50 border-r border-border text-sm font-medium text-muted-foreground h-11 flex items-center shrink-0 gap-2">
                        <Lock className="w-3.5 h-3.5 text-emerald-500" />
                        {protocol}
                      </div>
                      <input 
                        value={subdomain}
                        onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        className="flex-1 bg-transparent px-3 h-11 text-sm font-medium text-foreground focus:outline-none"
                        placeholder="my-awesome-funnel"
                      />
                      <div className="px-4 text-sm font-medium text-muted-foreground border-l border-border bg-muted/50 h-11 flex items-center shrink-0">
                        .{baseDomain}
                      </div>
                      <Button onClick={() => copyToClipboard(currentUrl)} variant="ghost" size="sm" className="h-11 px-4 rounded-none border-l border-border hover:bg-muted text-muted-foreground hover:text-foreground shrink-0">
                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    
                    <Button 
                        onClick={() => handleSaveDomain('subdomain')} 
                        disabled={saving}
                        className="mt-2"
                    >
                        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Subdomain
                    </Button>
                  </div>
                )}

                {activeTab === 'custom' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                     <p className="text-sm text-muted-foreground mb-4">
                      Connect your own custom domain (e.g., yourdomain.com). Update your DNS records accordingly.
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
                      <Button onClick={() => handleSaveDomain('custom')} disabled={saving} variant="secondary" className="h-11 px-5 rounded-none border-l border-border font-semibold shrink-0">
                         {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Verify Domain'}
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
                            <td className="px-5 py-4 text-muted-foreground font-mono text-xs text-foreground">76.76.21.21</td>
                          </tr>
                          <tr className="hover:bg-muted/50 transition-colors">
                            <td className="px-5 py-4 font-semibold text-purple-400">CNAME</td>
                            <td className="px-5 py-4 text-muted-foreground font-mono text-xs">www</td>
                            <td className="px-5 py-4 text-muted-foreground font-mono text-xs text-foreground">cname.ofiq.app</td>
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
                    <div className="p-5 flex items-start gap-4 hover:bg-muted/20 transition-colors">
                      <div className="mt-0.5 bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center shrink-0 border border-primary/30">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">Content Generated</h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">AI has successfully drafted all section copy and structures.</p>
                      </div>
                    </div>

                    <div className="p-5 flex items-start gap-4 hover:bg-muted/20 transition-colors">
                      <div className="mt-0.5 bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center shrink-0 border border-primary/30">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">Design System Sync</h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Visual styles and tokens applied across pages.</p>
                      </div>
                    </div>

                    <div className="p-5 flex items-start gap-4 hover:bg-muted/20 transition-colors bg-muted/10">
                      <div className={`mt-0.5 w-5 h-5 rounded-full border border-muted-foreground/40 flex items-center justify-center shrink-0 transition-colors ${hasConfiguredDomain ? 'bg-primary/20 border-primary/30 text-primary' : ''}`}>
                        {hasConfiguredDomain && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">Domain Verification</h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Connect your funnel to the public web.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deploy Action Area */}
                <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-5 shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-3 duration-300">
                    <Rocket className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight mb-2">Publish to Edge</h3>
                  <p className="text-sm text-muted-foreground mb-8 max-w-[280px]">
                    Deploy this funnel to our high-performance global edge network.
                  </p>
                  <Button 
                    size="lg" 
                    className="w-full max-w-xs font-semibold shadow-sm transition-all"
                    onClick={() => toast.success('Deployment initiated!')}
                  >
                    Deploy Funnel
                  </Button>
                </div>
            </div>

            {/* Empty State Analytics Area */}
            <div>
              <h3 className="text-sm font-semibold mb-4 text-foreground flex items-center gap-2">
                 Metrics Snapshot 
                 <span className="text-[10px] uppercase tracking-wider font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground">Preview</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { lbl: 'Total Views', val: '-', icon: '👁️' },
                    { lbl: 'Leads Captured', val: '-', icon: '🎯' },
                    { lbl: 'Sales Revenue', val: '-', icon: '💰' }
                  ].map((an, i) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-border/80 transition-colors">
                      <div className="text-2xl mb-3 opacity-60 grayscale">{an.icon}</div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">{an.lbl}</div>
                      <div className="text-3xl font-bold text-muted-foreground/50">{an.val}</div>
                    </div>
                  ))}
              </div>
            </div>

          </div>

          {/* Right Config Panel */}
          <div className="w-[300px] shrink-0 border-l border-border bg-card p-6 overflow-y-auto hidden lg:block">
             <div className="flex bg-muted/50 p-1 rounded-lg gap-1 mb-8 border border-border/50">
                <button className="flex-1 text-xs font-semibold text-foreground py-2 px-3 rounded-md bg-background shadow-sm border border-border/50">SEO</button>
                <button className="flex-1 text-xs font-medium text-muted-foreground hover:text-foreground py-2 px-3 rounded-md transition-colors">Scripts</button>
             </div>

             <div className="space-y-6">
               <div>
                 <h4 className="text-sm font-semibold mb-5 flex items-center gap-2 text-foreground">
                   <Globe className="w-4 h-4 text-muted-foreground" /> Meta Information
                 </h4>
                 
                 <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Page Title</label>
                      <input className="w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all" defaultValue={pageData?.name || 'Offer Funnel'} />
                   </div>

                   <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
                      <textarea className="w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all resize-none" rows={4} defaultValue="An amazing offer generated by OfferIQ." />
                   </div>
                 </div>
               </div>

               <div className="pt-6 border-t border-border">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-3">Social Sharing Image</label>
                  <div className="border border-border border-dashed bg-muted/30 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/80 hover:border-primary/40 transition-all group">
                    <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Plus className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="text-xs font-medium text-muted-foreground">Upload 1200x630px JPG/PNG</div>
                  </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
