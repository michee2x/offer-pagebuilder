"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Search, LayoutTemplate, Tag, Copy, ChevronRight } from "lucide-react";

type Template = {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
};

function TemplatesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get("workspace");

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [cloningId, setCloningId] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, [search, category]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append("search", search);
      if (category) query.append("category", category);

      const res = await fetch(`/api/templates?${query.toString()}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      setTemplates(data.templates || []);
      
      // Extract unique categories if not set
      if (!category && categories.length === 0) {
        const uniqueCategories = Array.from(new Set(data.templates.map((t: Template) => t.category).filter(Boolean)));
        setCategories(uniqueCategories as string[]);
      }
    } catch (error: any) {
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const handleClone = async (templateId: string, templateName: string) => {
    setCloningId(templateId);
    try {
      // In a real app, you might want to ask the user which workspace to clone to if they have multiple.
      // For now, we'll clone it and let the backend default to their primary or active workspace if needed.
      const res = await fetch(`/api/templates/${templateId}/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `${templateName} (Copy)`, workspaceId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to clone template");

      toast.success("Template cloned successfully!");
      // Redirect to the builder with the new funnel ID
      router.push(`/p/${data.funnelId}`);
    } catch (error: any) {
      toast.error(error.message);
      setCloningId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Template Library</h1>
            <p className="text-lg text-gray-500 mt-2">Start your next campaign in seconds with pre-built funnels.</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <Link href="/workspaces" className="text-gray-600 hover:text-gray-900 font-medium flex items-center">
              Go to Dashboard <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 mb-10">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
            />
          </div>
          <div className="w-full md:w-64">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none appearance-none bg-white"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-64 animate-pulse shadow-sm border border-gray-100"></div>
            ))}
          </div>
        ) : templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((template) => (
              <div key={template.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden group flex flex-col">
                <div className="h-40 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center border-b border-gray-100 relative">
                  <LayoutTemplate className="w-16 h-16 text-indigo-200 group-hover:scale-110 transition-transform duration-300" />
                  {template.category && (
                    <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-indigo-600 shadow-sm">
                      {template.category}
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{template.name}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{template.description}</p>
                  
                  {template.tags && template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {template.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="inline-flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                          <Tag className="w-3 h-3 mr-1" /> {tag}
                        </span>
                      ))}
                      {template.tags.length > 3 && (
                        <span className="text-xs text-gray-400">+{template.tags.length - 3}</span>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => handleClone(template.id, template.name)}
                    disabled={cloningId === template.id}
                    className="w-full flex items-center justify-center py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors focus:ring-4 focus:ring-indigo-100 disabled:bg-indigo-400"
                  >
                    {cloningId === template.id ? (
                      "Cloning Template..."
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" /> Use This Template
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 border-dashed">
            <LayoutTemplate className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500">We couldn't find any templates matching your search criteria.</p>
            {(search || category) && (
              <button 
                onClick={() => { setSearch(""); setCategory(""); }}
                className="mt-4 text-indigo-600 font-medium hover:text-indigo-800"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TemplatesMarketplacePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <TemplatesContent />
    </Suspense>
  );
}
