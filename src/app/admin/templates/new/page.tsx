"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function NewTemplatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    tags: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Template name is required");
      return;
    }

    setLoading(true);
    try {
      const tagsArray = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          tags: tagsArray,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create template");

      toast.success("Template created successfully!");
      router.push(`/admin/templates/${data.template.id}/edit`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <Link href="/admin/templates" className="text-gray-500 hover:text-gray-800 mb-4 inline-block">
          &larr; Back to Templates
        </Link>
        <h1 className="text-3xl font-bold">Create New Template</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="e.g., E-commerce Sales Funnel"
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
              placeholder="Briefly describe what this template is for..."
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
              placeholder="e.g., Agency, Coaching, E-commerce"
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
              placeholder="e.g., high-ticket, webinar, lead-gen"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400"
            >
              {loading ? "Creating..." : "Create Template"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
