"use client";

import { useEffect, useState } from "react";
import {
  User, MoreVertical, Eye, Edit2, Trash2, LogIn,
  Activity, LayoutTemplate, Settings, Flag,
  Loader2, Plus, X,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* ─── Types ──────────────────────────────────────────────────── */
type UserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  is_admin?: boolean;
};

type UserDetails = UserRow & {
  workspaces_count: number;
  funnels_count: number;
  leads_count: number;
  purchases_count: number;
  revenue: number;
};

/* ─── Helpers ─────────────────────────────────────────────────── */
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function roleBadge(u: Pick<UserRow, "role" | "is_admin">) {
  if (u.is_admin || u.role === "admin")
    return { label: "Admin", cls: "bg-purple-100 text-purple-700 border-purple-200" };
  if (u.role === "agency")
    return { label: "Agency", cls: "bg-blue-100 text-blue-700 border-blue-200" };
  return { label: "Free", cls: "bg-gray-100 text-gray-600 border-gray-200" };
}

/* ─── Component ───────────────────────────────────────────────── */
export default function AdminUsersDashboard() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  /* --- Create -------------------------------------------------- */
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [creating, setCreating] = useState(false);

  /* --- View ---------------------------------------------------- */
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewUser, setViewUser] = useState<UserDetails | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  /* --- Edit ---------------------------------------------------- */
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserRow | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "user" });
  const [editing, setEditing] = useState(false);

  /* ── fetch list ─────────────────────────────────────────────── */
  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (e) {
      console.error("Error fetching users:", e);
    } finally {
      setLoading(false);
    }
  };

  /* ── View ────────────────────────────────────────────────────── */
  const openView = async (user: UserRow) => {
    setIsViewOpen(true);
    setViewUser(null);
    setViewLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`);
      const data = await res.json();
      if (res.ok) {
        setViewUser(data.user);
      } else {
        toast.error(data.error || "Could not load user details");
        // Fallback — show what we already have
        setViewUser({
          ...user,
          workspaces_count: 0, funnels_count: 0,
          leads_count: 0, purchases_count: 0, revenue: 0,
        });
      }
    } catch {
      setViewUser({
        ...user,
        workspaces_count: 0, funnels_count: 0,
        leads_count: 0, purchases_count: 0, revenue: 0,
      });
    } finally {
      setViewLoading(false);
    }
  };

  /* ── Edit ────────────────────────────────────────────────────── */
  const openEdit = (user: UserRow) => {
    setEditTarget(user);
    setEditForm({ name: user.name ?? "", email: user.email, role: user.role ?? "user" });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setEditing(true);
    try {
      const res = await fetch(`/api/admin/users/${editTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update user");
      toast.success("User updated");
      setIsEditOpen(false);
      fetchUsers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setEditing(false);
    }
  };

  /* ── Create ──────────────────────────────────────────────────── */
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");
      toast.success("User created successfully");
      setIsCreateOpen(false);
      setCreateForm({ name: "", email: "", password: "", role: "user" });
      fetchUsers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  };

  /* ── Delete ──────────────────────────────────────────────────── */
  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this user? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");
      toast.success("User deleted");
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  /* ── Login as user ───────────────────────────────────────────── */
  const handleLoginAsUser = async (email: string) => {
    const tid = toast.loading("Switching to user account…");
    try {
      const res = await fetch("/api/admin/users/login-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get login token");

      if (data.token) {
        const supabase = createClient();
        const { error } = await supabase.auth.verifyOtp({
          token_hash: data.token,
          type: "magiclink",
        });
        if (error) throw error;
        toast.dismiss(tid);
        toast.success("Logged in as user");
        window.location.href = "/";
      }
    } catch (err: unknown) {
      toast.dismiss(tid);
      toast.error(err instanceof Error ? err.message : "Login failed");
    }
  };

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Users</h1>
            <p className="text-sm text-gray-500">{users.length} registered account{users.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create User
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
          <span className="text-gray-500">Loading users…</span>
        </div>
      ) : users.length === 0 ? (
        <div className="border border-gray-200 rounded-xl p-16 text-center bg-white shadow-sm">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900">No users found</h3>
          <p className="text-gray-500 mt-2">Get started by creating your first user.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Name / Email</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Quick actions</th>
                <th className="px-6 py-4 text-right">More</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => {
                const badge = roleBadge(user);
                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">

                    {/* Name / email */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                          {(user.name?.[0] || user.email?.[0] || "?").toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.name || "Unnamed User"}</p>
                          <p className="text-gray-500 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                        Active
                      </span>
                    </td>

                    {/* Plan / role */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>

                    {/* Quick-action icon buttons */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          title="View user details & stats"
                          onClick={() => openView(user)}
                          className="p-1.5 rounded-md text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <Activity className="w-4 h-4" />
                        </button>
                        <button
                          title="View user's funnels"
                          onClick={() => openView(user)}
                          className="p-1.5 rounded-md text-gray-400 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                        >
                          <LayoutTemplate className="w-4 h-4" />
                        </button>
                        <button
                          title="Edit user settings"
                          onClick={() => openEdit(user)}
                          className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          title="Login as this user"
                          onClick={() => handleLoginAsUser(user.email)}
                          className="p-1.5 rounded-md text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                        >
                          <Flag className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                    {/* Dropdown */}
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 bg-white border border-gray-200 shadow-lg rounded-xl">
                          <DropdownMenuItem
                            onClick={() => openView(user)}
                            className="text-gray-700 hover:bg-gray-100 cursor-pointer px-3 py-2 rounded-md"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openEdit(user)}
                            className="text-gray-700 hover:bg-gray-100 cursor-pointer px-3 py-2 rounded-md"
                          >
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleLoginAsUser(user.email)}
                            className="text-gray-700 hover:bg-gray-100 cursor-pointer px-3 py-2 rounded-md"
                          >
                            <LogIn className="mr-2 h-4 w-4" />
                            Login As
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-100" />
                          <DropdownMenuItem
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer px-3 py-2 rounded-md focus:bg-red-50 focus:text-red-700"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ══ VIEW MODAL ══════════════════════════════════════════ */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-lg bg-white border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">User Details</DialogTitle>
          </DialogHeader>

          {viewLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : viewUser ? (
            <div className="space-y-5 py-1">

              {/* Profile header */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xl shadow-sm shrink-0">
                  {(viewUser.name?.[0] || viewUser.email?.[0] || "?").toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-lg leading-tight truncate">
                    {viewUser.name || "Unnamed User"}
                  </p>
                  <p className="text-gray-500 text-sm truncate">{viewUser.email}</p>
                  <span className={`inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${roleBadge(viewUser).cls}`}>
                    {roleBadge(viewUser).label}
                  </span>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Workspaces", value: viewUser.workspaces_count },
                  { label: "Funnels", value: viewUser.funnels_count },
                  { label: "Leads", value: viewUser.leads_count },
                  { label: "Revenue", value: `$${(viewUser.revenue).toLocaleString()}` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
                    <p className="text-2xl font-black text-gray-900 mt-1 tabular-nums">{value}</p>
                  </div>
                ))}
              </div>

              {/* Meta */}
              <div className="border-t border-gray-100 pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">User ID</span>
                  <code className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded font-mono">
                    {viewUser.id.slice(0, 18)}…
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Joined</span>
                  <span className="font-medium text-gray-800">{fmtDate(viewUser.created_at)}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700"
                  onClick={() => { setIsViewOpen(false); openEdit(viewUser); }}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit User
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => { setIsViewOpen(false); handleLoginAsUser(viewUser.email); }}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login As
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* ══ EDIT MODAL ══════════════════════════════════════════ */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Edit User
              {editTarget && (
                <span className="ml-2 text-sm font-normal text-gray-500">— {editTarget.email}</span>
              )}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-gray-700">Full Name</Label>
              <Input
                id="edit-name"
                placeholder="John Doe"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="border-gray-300 text-gray-900 bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email" className="text-gray-700">Email Address</Label>
              <Input
                id="edit-email"
                type="email"
                required
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="border-gray-300 text-gray-900 bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role" className="text-gray-700">Role</Label>
              <select
                id="edit-role"
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <option value="user">User (Free)</option>
                <option value="agency">Agency</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={editing}
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[110px]"
              >
                {editing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
                ) : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ══ CREATE MODAL ════════════════════════════════════════ */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Create New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-name" className="text-gray-700">Full Name</Label>
              <Input
                id="create-name"
                placeholder="John Doe"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                className="border-gray-300 text-gray-900 bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-email" className="text-gray-700">Email Address <span className="text-red-500">*</span></Label>
              <Input
                id="create-email"
                type="email"
                required
                placeholder="john@example.com"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                className="border-gray-300 text-gray-900 bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-password" className="text-gray-700">Password</Label>
              <Input
                id="create-password"
                type="password"
                placeholder="Leave blank to auto-generate"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                className="border-gray-300 text-gray-900 bg-white"
              />
              <p className="text-xs text-gray-400">
                If left blank, a secure password is auto-generated and the user can set their own via magic link.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-role" className="text-gray-700">Role</Label>
              <select
                id="create-role"
                value={createForm.role}
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <option value="user">User (Free)</option>
                <option value="agency">Agency</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={creating}
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
              >
                {creating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating…</>
                ) : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
