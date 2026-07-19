"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutTemplate, Plus, Trash2, Edit2, Zap, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminDashboard() {
  const router = useRouter();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  
  // Modal State
  const [selectedWorkspace, setSelectedWorkspace] = useState("");
  const [category, setCategory] = useState("SaaS");
  const [tags, setTags] = useState("");

  const categories = [
    "SaaS",
    "Coaching",
    "E-commerce",
    "Agency",
    "Local Business",
    "Course",
    "Other"
  ];

  useEffect(() => {
    fetchTemplates();
    fetchWorkspaces();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/templates");
      const data = await res.json();
      if (data.templates) setTemplates(data.templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkspaces = async () => {
    try {
      const res = await fetch("/api/workspaces");
      const data = await res.json();
      if (data.workspaces) {
        setWorkspaces(data.workspaces);
        if (data.workspaces.length > 0) {
          setSelectedWorkspace(data.workspaces[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching workspaces:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this template? (This will unmark it as a template, but won't delete the funnel).")) return;
    try {
      const res = await fetch(`/api/admin/templates/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Template removed");
      fetchTemplates();
    } catch (error) {
      toast.error("Failed to remove template");
    }
  };

  const handleCreateTemplate = () => {
    if (!selectedWorkspace) {
      toast.error("Please select a workspace");
      return;
    }
    const url = `/analyze?workspace=${selectedWorkspace}&isTemplate=true&templateCategory=${encodeURIComponent(category)}&templateTags=${encodeURIComponent(tags)}`;
    router.push(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Template Management</h1>
              <p className="text-white/50 mt-1 text-sm">Manage global templates available to all users.</p>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="h-10 px-4 rounded-xl bg-white text-black font-bold flex items-center gap-2 hover:bg-white/90 transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              Create Template
            </button>
          </div>

          {loading ? (
            <div className="text-white/50 text-center py-20">Loading templates...</div>
          ) : templates.length === 0 ? (
            <div className="border border-white/10 rounded-2xl p-16 text-center bg-white/[0.02]">
              <LayoutTemplate className="w-10 h-10 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white">No templates found</h3>
              <p className="text-white/50 mt-1">Create your first template to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(template => (
                <div key={template.id} className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all">
                  <div className="aspect-[16/9] bg-[#1a1a2e] relative group">
                    {(template.og_image_url || (template.blocks as any)?.og_image_url) ? (
                      <img src={template.og_image_url || (template.blocks as any).og_image_url} alt={template.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center opacity-30 text-white gap-3">
                        <LayoutTemplate className="w-12 h-12" />
                        <span className="text-sm font-medium">No Preview</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <span className="px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
                        {template.template_category || 'Uncategorized'}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white truncate">{template.name}</h3>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {(template.template_tags || []).map((tag: string, i: number) => (
                        <span key={i} className="text-xs text-brand-blue bg-brand-blue/10 px-2 py-1 rounded-md">#{tag}</span>
                      ))}
                    </div>
                    <div className="mt-5 pt-4 border-t border-white/10 flex justify-between">
                      <Link href={`/funnels/${template.id}`} className="text-sm text-white/70 hover:text-white flex items-center gap-1.5">
                        <Edit2 className="w-4 h-4" /> Edit Funnel
                      </Link>
                      <button onClick={() => handleDelete(template.id)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#131826] border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Create Template</h2>
              <button onClick={() => setShowModal(false)} className="text-white/50 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5 block">Workspace to generate in</label>
                <select 
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-blue"
                  value={selectedWorkspace}
                  onChange={(e) => setSelectedWorkspace(e.target.value)}
                >
                  {workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5 block">Template Category</label>
                <select 
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-blue"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5 block">Tags (comma separated)</label>
                <input 
                  type="text" 
                  placeholder="webinar, course, high-ticket"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-blue"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>

              <button 
                onClick={handleCreateTemplate}
                className="w-full h-12 rounded-xl bg-white text-black font-bold mt-4 hover:bg-white/90 transition-all"
              >
                Start Campaign Flow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
