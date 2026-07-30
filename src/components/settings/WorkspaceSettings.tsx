"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Layout, Globe, Trash2, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface WorkspaceSettingsProps {
  workspace: any;
  onUpdate: (updated: any) => void;
}

export function WorkspaceSettings({ workspace, onUpdate }: WorkspaceSettingsProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [formData, setFormData] = useState({
    name: workspace?.name || "",
    domain: workspace?.domain || "",
  });

  const handleSave = async () => {
    if (!workspace) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/workspaces", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: workspace.id,
          name: formData.name,
          domain: formData.domain,
        }),
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Update failed");
      }
      
      const data = await res.json();
      onUpdate(data.workspace);
      toast.success("Workspace settings saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!workspace || deleteInput !== workspace.domain) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/workspaces?id=${workspace.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deletion failed");
      
      if (data.action === 'archived') {
        toast.success("Workspace archived. It will be permanently deleted in 7 days.");
        onUpdate({ ...workspace, status: 'archived', archived_at: new Date().toISOString() });
      } else {
        toast.success("Workspace deleted successfully");
        router.push("/");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete workspace");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!workspace) return null;

  const hasProjects = workspace.builder_pages && workspace.builder_pages.length > 0;
  const isArchived = workspace.status === 'archived';

  const handleReactivate = async () => {
    setIsReactivating(true);
    try {
      const res = await fetch("/api/workspaces", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: workspace.id, action: 'reactivate' }),
      });
      if (!res.ok) throw new Error("Failed to reactivate");
      const data = await res.json();
      onUpdate(data.workspace);
      toast.success("Workspace reactivated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to reactivate");
    } finally {
      setIsReactivating(false);
    }
  };

  if (isArchived) {
    // Calculate days remaining
    const archivedDate = new Date(workspace.archived_at);
    const deletionDate = new Date(archivedDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const daysRemaining = Math.max(0, Math.ceil((deletionDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)));

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Workspace Archived</h2>
          <p className="text-[#aaa] mb-6 max-w-md">
            This workspace was archived and is scheduled for permanent deletion in <strong className="text-white">{daysRemaining} days</strong>. Reactivate it to restore access to all projects and funnels.
          </p>
          <Button 
            onClick={handleReactivate}
            disabled={isReactivating}
            className="h-12 px-8 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all"
          >
            {isReactivating ? "Reactivating..." : "Reactivate Workspace"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section>
        <div className="flex flex-col gap-1 mb-10">
          <h1 className="text-2xl font-bold text-white tracking-tight">Workspace General</h1>
          <p className="text-[#555] text-sm">Configure your team&apos;s workspace and environment.</p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-2">
            <Label className="text-[#999] text-xs font-semibold ml-1">Workspace Name</Label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#444] group-focus-within:text-brand-blue transition-colors">
                <Layout className="w-4 h-4" />
              </div>
              <Input 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="pl-11 h-12 bg-white/5 backdrop-blur-md border-white/5 focus:border-brand-blue/40 transition-all rounded-xl text-white" 
                placeholder="My Awesome Team"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#999] text-xs font-semibold ml-1">Subdomain</Label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#444] group-focus-within:text-brand-blue transition-colors">
                <Globe className="w-4 h-4" />
              </div>
              <Input 
                value={formData.domain}
                onChange={e => setFormData({...formData, domain: e.target.value})}
                className="pl-11 h-12 bg-white/5 backdrop-blur-md border-white/5 focus:border-brand-blue/40 transition-all rounded-xl text-white" 
                placeholder="my-team"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-mono text-[#444]">
                .offeriq.app
              </div>
            </div>
            <p className="text-[10px] text-[#444] ml-1 mt-1.5 leading-relaxed">
              This will be used for your public funnel URLs. Only lowercase letters, numbers, and hyphens.
            </p>
          </div>
        </div>

        <div className="mt-12 flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="h-11 px-8 rounded-xl bg-gradient-to-r from-brand-blue to-brand-indigo hover:opacity-90 text-white font-bold transition-all hover:shadow-[0_8px_24px_rgba(59,130,246,0.25)] active:scale-95 border-0"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="pt-12 border-t border-white/5">
        <div className="bg-rose-500/[0.03] border border-rose-500/10 rounded-2xl p-8 relative overflow-hidden group">
          <div className="absolute -right-12 -top-12 w-32 h-32 bg-rose-500/10 blur-[60px] group-hover:bg-rose-500/20 transition-all" />
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5 text-rose-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">
                {hasProjects ? "Archive Workspace" : "Delete Workspace"}
              </h3>
              <p className="text-[#666] text-sm leading-relaxed max-w-xl">
                {hasProjects 
                  ? "Archive this workspace. It will be hidden and scheduled for permanent deletion in 7 days."
                  : "Permanently remove this workspace. This action is irreversible since there are no projects."}
              </p>
              <div className="mt-8">
                <Button 
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="ghost"
                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 h-10 px-6 rounded-xl text-xs font-bold transition-all"
                >
                  {hasProjects ? "Archive Workspace" : "Delete Workspace"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#111] border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-rose-500/[0.02] pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-[#555]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">{hasProjects ? "Archive Workspace?" : "Delete Workspace?"}</h2>
            <p className="text-[#666] text-sm leading-relaxed mb-8">
              {hasProjects 
                ? <>This will archive <span className="text-white font-bold">{workspace.name}</span> for 7 days before permanent deletion. To confirm, please type <span className="text-rose-500 font-mono font-bold">{workspace.domain}</span> below.</>
                : <>This will permanently delete <span className="text-white font-bold">{workspace.name}</span>. To confirm, please type <span className="text-rose-500 font-mono font-bold">{workspace.domain}</span> below.</>}
            </p>

            <div className="space-y-4">
              <Input 
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                placeholder={workspace.domain}
                className="h-12 bg-black/40 border-white/5 focus:border-rose-500/40 text-center font-mono text-sm tracking-wider rounded-xl transition-all"
              />
              
              <Button 
                onClick={handleDelete}
                disabled={isDeleting || deleteInput !== workspace.domain}
                className={cn(
                  "w-full h-12 rounded-xl font-bold transition-all active:scale-95",
                  deleteInput === workspace.domain
                    ? "bg-rose-500 hover:bg-rose-600 text-white shadow-[0_8px_24px_rgba(244,63,94,0.3)]"
                    : "bg-white/5 text-[#444] cursor-not-allowed"
                )}
              >
                {isDeleting ? "Processing..." : (hasProjects ? "Archive Workspace" : "Permanently Delete")}
              </Button>
              
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full text-center text-xs text-[#555] hover:text-white transition-colors py-2"
              >
                Nevermind, keep it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
