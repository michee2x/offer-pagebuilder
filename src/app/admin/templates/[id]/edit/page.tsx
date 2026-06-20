"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    tags: "",
    is_active: true,
  });

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const res = await fetch(`/api/templates/${templateId}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error);

        const t = data.template;
        setFormData({
          name: t.name || "",
          description: t.description || "",
          category: t.category || "",
          tags: t.tags ? t.tags.join(", ") : "",
          is_active: t.is_active,
        });
      } catch (error: any) {
        toast.error("Failed to load template: " + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (templateId) fetchTemplate();
  }, [templateId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === "is_active" ? value === "true" : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Template name is required");
      return;
    }

    setSaving(true);
    try {
      const tagsArray = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const res = await fetch(`/api/templates/${templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          tags: tagsArray,
          is_active: formData.is_active,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update template");

      toast.success("Template updated successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    
    try {
      const res = await fetch(`/api/templates/${templateId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete template");
      
      toast.success("Template deleted!");
      router.push("/admin/templates");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading template...</div>;
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <Link href="/admin/templates" className="text-gray-500 hover:text-gray-800 mb-4 inline-block">
            &larr; Back to Templates
          </Link>
          <h1 className="text-3xl font-bold">Edit Template</h1>
        </div>
        <div className="flex gap-4">
          <Link
            href={`/builder?id=${templateId}&isTemplate=true`}
            target="_blank"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Open in Builder
          </Link>
          <button
            onClick={handleDelete}
            className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-md hover:bg-red-100 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="is_active"
              value={formData.is_active.toString()}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option value="true">Active (Visible to users)</option>
              <option value="false">Draft (Hidden)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
