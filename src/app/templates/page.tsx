"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Search, LayoutTemplate, Tag, Copy, ChevronLeft, Zap, ArrowRight } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useUIStore } from "@/store/uiStore";
import { Spinner } from "@/components/ui/spinner";

type Template = {
  id: string;
  name: string;
  template_category: string;
  template_tags: string[];
  blocks: any;
  og_image_url?: string;
};

function TemplatesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlWorkspaceId = searchParams.get("workspace");
  const { activeWorkspaceId, setActiveWorkspaceId } = useUIStore();
  
  const workspaceId = urlWorkspaceId || activeWorkspaceId;

  useEffect(() => {
    if (urlWorkspaceId && urlWorkspaceId !== activeWorkspaceId) {
      setActiveWorkspaceId(urlWorkspaceId);
    }
  }, [urlWorkspaceId, activeWorkspaceId, setActiveWorkspaceId]);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cloningId, setCloningId] = useState<string | null>(null);

  const categories = ["All", "SaaS", "Coaching", "E-commerce", "Agency", "Local Business", "Course", "Other"];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/templates");
      const data = await res.json();
      if (data.templates) setTemplates(data.templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const handleClone = async (templateId: string, templateName: string) => {
    if (!workspaceId) {
      toast.error("No active workspace selected. Please select a workspace from the dashboard first.");
      router.push("/");
      return;
    }

    try {
      setCloningId(templateId);
      toast.loading(`Cloning ${templateName}...`);

      const res = await fetch(`/api/templates/${templateId}/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `${templateName} (Copy)`, workspaceId }),
      });

      const data = await res.json();
      toast.dismiss();

      if (!res.ok) throw new Error(data.error);

      toast.success("Template cloned successfully!");
      router.push(`/funnels/${data.funnelId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to clone template");
      setCloningId(null);
    }
  };

  const filteredTemplates = templates.filter((t) => {
    const matchCategory = category === "All" || t.template_category === category;
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
      (t.template_tags && t.template_tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())));
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col items-center overflow-hidden relative">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[80px] right-[-480px] w-[994px] h-[800px] opacity-40" style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgb(236, 72, 153) 0%, rgba(236, 72, 153, 0) 100%)', transform: 'rotate(-30deg)' }} />
        <div className="absolute top-[80px] left-[-480px] w-[994px] h-[800px] opacity-40" style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgb(59, 130, 246) 0%, rgba(59, 130, 246, 0) 100%)', transform: 'rotate(30deg)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-[522px] opacity-[0.36] z-[1]" style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgb(140, 22, 250) 0%, rgba(140, 22, 250, 0) 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-[240px] z-[2] opacity-100" style={{ background: 'linear-gradient(180deg, rgba(3, 7, 18, 0) 0%, rgb(3, 7, 18) 100%)' }} />
        <div className="absolute inset-0 opacity-10 pointer-events-none z-[1]" style={{ backgroundImage: 'url(https://framerusercontent.com/images/6mcf62RlDfRfU61Yg5vb2pefpi4.png)', backgroundRepeat: 'repeat', backgroundSize: '128px auto' }} />
      </div>

      <Sidebar />

      <div className="flex-1 w-full flex flex-col min-w-0 overflow-hidden relative z-10">
        <Topbar breadcrumbs={[{ label: "Workspaces", href: "/" }, { label: "Template Library" }]} />

        <main className="flex-1 overflow-y-auto p-6 md:p-12">
          <div className="max-w-[1200px] mx-auto">
            {/* Header */}
            <div className="mb-12">
              <h1 className="text-[48px] md:text-[56px] font-bold text-white tracking-tight mb-4 leading-[1.1]">
                Template Library
              </h1>
              <p className="text-[18px] text-white/50 max-w-2xl font-light">
                Skip the setup. Start with a proven, high-converting funnel template and customize it for your offer in minutes.
              </p>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-10">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Search templates or tags..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-full pl-12 pr-4 text-white focus:outline-none focus:border-brand-blue focus:bg-white/[0.05] transition-all placeholder:text-white/30"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`h-12 px-6 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                      category === cat
                        ? "bg-white text-black font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        : "bg-white/[0.03] border border-white/10 text-white/70 hover:bg-white/[0.08] hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Spinner size="md" />
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center border border-white/10 rounded-3xl p-16 text-center bg-white/[0.02] backdrop-blur-sm">
                <LayoutTemplate className="w-12 h-12 text-white/20 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No templates found</h3>
                <p className="text-white/50">We couldn't find any templates matching your search criteria.</p>
                <button 
                  onClick={() => { setSearch(''); setCategory('All'); }}
                  className="mt-6 h-10 px-6 rounded-full bg-white/[0.05] border border-white/10 text-white font-medium hover:bg-white/[0.1] transition-all"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                {filteredTemplates.map((template) => (
                  <div key={template.id} className="group relative rounded-3xl overflow-hidden bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                    {/* Image Preview */}
                    <div className="aspect-[16/10] bg-[#0A0A0F] relative overflow-hidden">
                      {(template.og_image_url || template.blocks?.og_image_url) ? (
                        <img 
                          src={template.og_image_url || template.blocks?.og_image_url} 
                          alt={template.name} 
                          className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700" 
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center opacity-30 text-white gap-3 bg-gradient-to-br from-brand-blue/10 to-brand-purple/10">
                          <LayoutTemplate className="w-12 h-12" />
                          <span className="text-sm font-medium tracking-widest uppercase">No Preview</span>
                        </div>
                      )}
                      
                      {/* Top Badges */}
                      <div className="absolute top-4 right-4 flex gap-2">
                        <span className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
                          {template.template_category || 'Uncategorized'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-brand-blue transition-colors truncate">
                        {template.name}
                      </h3>
                      
                      {/* Tags */}
                      <div className="flex gap-2 flex-wrap mb-8 min-h-[28px]">
                        {(template.template_tags || []).slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-xs font-medium text-white/50 bg-white/[0.03] border border-white/5 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                        {(template.template_tags?.length > 3) && (
                          <span className="text-xs font-medium text-white/40 px-1 py-1">
                            +{template.template_tags.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => handleClone(template.id, template.name)}
                        disabled={cloningId === template.id}
                        className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                          cloningId === template.id 
                            ? 'bg-white/10 text-white/50 cursor-not-allowed'
                            : 'bg-white text-black hover:bg-white/90 active:scale-[0.98]'
                        }`}
                      >
                        {cloningId === template.id ? (
                          <>
                            <Spinner size="sm" color="white" />
                            Cloning...
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Use This Template
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function TemplatesMarketplacePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <Spinner size="md" />
      </div>
    }>
      <TemplatesContent />
    </Suspense>
  );
}
