"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Folder,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  X,
  Globe,
  Layout,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Workspace {
  id: string;
  name: string;
  domain: string;
  status?: string;
  archived_at?: string;
  created_at: string;
  builder_pages?: Array<{ id: string }>;
}

function WorkspacesContent() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", domain: "" });
  const [isSaving, setIsSaving] = useState(false);

  const [deletingWorkspace, setDeletingWorkspace] = useState<Workspace | null>(null);
  const [deleteInput, setDeleteInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", domain: "" });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  async function fetchWorkspaces() {
    try {
      const res = await fetch("/api/workspaces?include_archived=true");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setWorkspaces(data.workspaces || []);
    } catch {
      toast.error("Could not load workspaces");
    } finally {
      setIsLoading(false);
    }
  }

  function startEdit(ws: Workspace) {
    setEditingId(ws.id);
    setEditForm({ name: ws.name, domain: ws.domain });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({ name: "", domain: "" });
  }

  async function handleSave(wsId: string) {
    if (!editForm.name.trim() || !editForm.domain.trim()) {
      toast.error("Name and domain are required");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/workspaces", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: wsId, name: editForm.name, domain: editForm.domain }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Update failed");
      }
      const data = await res.json();
      setWorkspaces((prev) => prev.map((w) => (w.id === wsId ? data.workspace : w)));
      setEditingId(null);
      toast.success("Workspace updated");
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingWorkspace || deleteInput !== deletingWorkspace.domain) return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/workspaces?id=" + deletingWorkspace.id, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deletion failed");
      if (data.action === "archived") {
        toast.success("Workspace archived. Permanently deleted in 7 days.");
        setWorkspaces((prev) =>
          prev.map((w) =>
            w.id === deletingWorkspace.id
              ? { ...w, status: "archived", archived_at: new Date().toISOString() }
              : w
          )
        );
      } else {
        toast.success("Workspace deleted");
        setWorkspaces((prev) => prev.filter((w) => w.id !== deletingWorkspace.id));
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to delete");
    } finally {
      setIsDeleting(false);
      setDeletingWorkspace(null);
      setDeleteInput("");
    }
  }

  async function handleCreate() {
    if (!createForm.name.trim() || !createForm.domain.trim()) {
      toast.error("Name and domain are required");
      return;
    }
    setIsCreating(true);
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createForm.name.trim(),
          domain: createForm.domain.trim().toLowerCase(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");
      setWorkspaces((prev) => [...prev, data.workspace]);
      setShowCreate(false);
      setCreateForm({ name: "", domain: "" });
      toast.success("Workspace created!");
    } catch (e: any) {
      toast.error(e.message || "Failed to create workspace");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleReactivate(ws: Workspace) {
    try {
      const res = await fetch("/api/workspaces", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ws.id, action: "reactivate" }),
      });
      if (!res.ok) throw new Error("Failed to reactivate");
      const data = await res.json();
      setWorkspaces((prev) => prev.map((w) => (w.id === ws.id ? data.workspace : w)));
      toast.success("Workspace reactivated");
    } catch (e: any) {
      toast.error(e.message || "Failed to reactivate");
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#030712] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const active = workspaces.filter((w) => w.status !== "archived");
  const archived = workspaces.filter((w) => w.status === "archived");

  return (
    <div className="flex h-screen overflow-hidden bg-[#030712]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar breadcrumbs={[{ label: "Workspaces", href: "/workspaces" }]} />
        <main className="flex-1 overflow-y-auto p-8 md:p-12">
          <div className="max-w-3xl mx-auto space-y-10">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Workspaces</h1>
                <p className="text-[#555] text-sm mt-1">
                  Manage all your workspaces — rename or delete them individually.
                </p>
              </div>
              <Button
                onClick={() => setShowCreate(true)}
                className="h-10 px-5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-indigo hover:opacity-90 text-white font-bold text-sm border-0 shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Workspace
              </Button>
            </div>

            {/* Create Form */}
            {showCreate && (
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-bold text-white">Create New Workspace</h3>
                  <button
                    onClick={() => { setShowCreate(false); setCreateForm({ name: "", domain: "" }); }}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-[#555] hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div className="space-y-1.5">
                    <Label className="text-[#999] text-xs font-semibold ml-1">Workspace Name</Label>
                    <div className="relative">
                      <Layout className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
                      <Input
                        value={createForm.name}
                        onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                        placeholder="My Team"
                        className="pl-10 h-11 bg-white/5 border-white/5 rounded-xl text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[#999] text-xs font-semibold ml-1">Subdomain</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
                      <Input
                        value={createForm.domain}
                        onChange={(e) =>
                          setCreateForm({
                            ...createForm,
                            domain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                          })
                        }
                        placeholder="my-team"
                        className="pl-10 pr-24 h-11 bg-white/5 border-white/5 rounded-xl text-white font-mono text-sm"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#444] font-mono">
                        .offeriq.app
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => { setShowCreate(false); setCreateForm({ name: "", domain: "" }); }}
                    className="h-10 px-5 rounded-xl text-[#666] hover:text-white hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={isCreating}
                    className="h-10 px-6 rounded-xl bg-gradient-to-r from-brand-blue to-brand-indigo hover:opacity-90 text-white font-bold border-0"
                  >
                    {isCreating ? <Spinner size="sm" color="white" /> : "Create Workspace"}
                  </Button>
                </div>
              </div>
            )}

            {/* Active Workspace List */}
            {active.length === 0 && !showCreate ? (
              <div className="text-center py-20">
                <Folder className="w-12 h-12 mx-auto mb-4 text-[#333]" />
                <p className="text-base font-medium text-white/30">No workspaces yet</p>
                <p className="text-sm text-[#444] mt-1">Create your first workspace to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {active.map((ws) => {
                  const isEditing = editingId === ws.id;
                  const pageCount = ws.builder_pages?.length ?? 0;

                  return (
                    <div
                      key={ws.id}
                      className={
                        "bg-white/[0.03] border rounded-2xl overflow-hidden transition-all duration-200 " +
                        (isEditing
                          ? "border-brand-blue/30 shadow-[0_0_0_1px_rgba(59,130,246,0.15)]"
                          : "border-white/[0.07] hover:border-white/[0.12]")
                      }
                    >
                      {isEditing ? (
                        /* Edit mode */
                        <div className="p-6 animate-in fade-in duration-200">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-9 h-9 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center">
                              <Folder className="w-4 h-4 text-brand-blue" />
                            </div>
                            <div>
                              <p className="text-xs text-[#555] font-medium">Editing workspace</p>
                              <p className="text-sm font-bold text-white">{ws.name}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                            <div className="space-y-1.5">
                              <Label className="text-[#999] text-xs font-semibold ml-1">Name</Label>
                              <div className="relative">
                                <Layout className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
                                <Input
                                  value={editForm.name}
                                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                  className="pl-10 h-11 bg-white/5 border-white/5 rounded-xl text-white"
                                />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[#999] text-xs font-semibold ml-1">Subdomain</Label>
                              <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
                                <Input
                                  value={editForm.domain}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      domain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                                    })
                                  }
                                  className="pl-10 pr-24 h-11 bg-white/5 border-white/5 rounded-xl text-white font-mono text-sm"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#444] font-mono">
                                  .offeriq.app
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end gap-3">
                            <Button
                              variant="ghost"
                              onClick={cancelEdit}
                              className="h-10 px-5 rounded-xl text-[#666] hover:text-white hover:bg-white/5"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => handleSave(ws.id)}
                              disabled={isSaving}
                              className="h-10 px-6 rounded-xl bg-gradient-to-r from-brand-blue to-brand-indigo hover:opacity-90 text-white font-bold border-0"
                            >
                              {isSaving ? <Spinner size="sm" color="white" /> : "Save Changes"}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* View mode */
                        <div className="flex items-center gap-4 px-5 py-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                            <Folder className="w-5 h-5 text-[#666]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-white truncate">{ws.name}</h3>
                            <p className="text-xs text-[#555] font-mono mt-0.5">
                              {ws.domain}.offeriq.app
                              <span className="font-sans text-[#444] ml-2">
                                &nbsp;&middot; {pageCount} {pageCount === 1 ? "campaign" : "campaigns"}
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Link href={"/?workspace=" + ws.id}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 px-4 rounded-xl text-xs text-[#666] hover:text-white hover:bg-white/5"
                              >
                                Open
                                <ChevronRight className="w-3.5 h-3.5 ml-1" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEdit(ws)}
                              className="h-9 w-9 p-0 rounded-xl text-[#666] hover:text-white hover:bg-white/5"
                              title="Rename workspace"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setDeletingWorkspace(ws); setDeleteInput(""); }}
                              className="h-9 w-9 p-0 rounded-xl text-[#666] hover:text-rose-500 hover:bg-rose-500/10"
                              title="Delete workspace"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Archived Workspaces */}
            {archived.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-white/5">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#444] px-1">
                  Archived
                </h2>
                {archived.map((ws) => {
                  const archivedDate = ws.archived_at ? new Date(ws.archived_at) : null;
                  const daysLeft = archivedDate
                    ? Math.max(
                        0,
                        Math.ceil((archivedDate.getTime() + 7 * 86400000 - Date.now()) / 86400000)
                      )
                    : null;
                  return (
                    <div
                      key={ws.id}
                      className="bg-orange-500/[0.03] border border-orange-500/10 rounded-2xl px-5 py-4 flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-white/60 truncate">{ws.name}</h3>
                        <p className="text-xs text-orange-500/70 mt-0.5">
                          Archived &middot; {daysLeft !== null ? daysLeft + " days until permanent deletion" : ""}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleReactivate(ws)}
                        className="h-9 px-4 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 text-xs font-bold"
                      >
                        Reactivate
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Delete / Archive Confirmation Modal */}
      {deletingWorkspace && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#111] border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-rose-500/[0.02] pointer-events-none" />
            <div className="flex items-center justify-between mb-6">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>
              <button
                onClick={() => { setDeletingWorkspace(null); setDeleteInput(""); }}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-[#555]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {(deletingWorkspace.builder_pages?.length ?? 0) > 0
                ? "Archive Workspace?"
                : "Delete Workspace?"}
            </h2>
            <p className="text-[#666] text-sm leading-relaxed mb-8">
              {(deletingWorkspace.builder_pages?.length ?? 0) > 0
                ? "This will archive "
                : "This will permanently delete "}
              <span className="text-white font-bold">{deletingWorkspace.name}</span>
              {(deletingWorkspace.builder_pages?.length ?? 0) > 0
                ? " for 7 days before permanent deletion."
                : "."}
              {" "}Type{" "}
              <span className="text-rose-500 font-mono font-bold">{deletingWorkspace.domain}</span>
              {" "}to confirm.
            </p>
            <div className="space-y-4">
              <Input
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder={deletingWorkspace.domain}
                className="h-12 bg-black/40 border-white/5 focus:border-rose-500/40 text-center font-mono text-sm tracking-wider rounded-xl transition-all"
              />
              <Button
                onClick={handleDelete}
                disabled={isDeleting || deleteInput !== deletingWorkspace.domain}
                className={
                  "w-full h-12 rounded-xl font-bold transition-all active:scale-95 " +
                  (deleteInput === deletingWorkspace.domain
                    ? "bg-rose-500 hover:bg-rose-600 text-white shadow-[0_8px_24px_rgba(244,63,94,0.3)]"
                    : "bg-white/5 text-[#444] cursor-not-allowed")
                }
              >
                {isDeleting
                  ? "Processing..."
                  : (deletingWorkspace.builder_pages?.length ?? 0) > 0
                  ? "Archive Workspace"
                  : "Permanently Delete"}
              </Button>
              <button
                onClick={() => { setDeletingWorkspace(null); setDeleteInput(""); }}
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

export default function WorkspacesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen bg-[#030712] items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <WorkspacesContent />
    </Suspense>
  );
}
