"use client";

import { useEffect, useState } from "react";
import { Zap, Trash2, Shield, User } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type UserData = {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
};

export default function AdminUsersDashboard() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role: newRole }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      toast.success("User role updated");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user role");
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col overflow-hidden relative">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[80px] right-[-480px] w-[994px] h-[800px] opacity-40" style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgb(236, 72, 153) 0%, rgba(236, 72, 153, 0) 100%)', transform: 'rotate(-30deg)' }} />
        <div className="absolute top-[80px] left-[-480px] w-[994px] h-[800px] opacity-40" style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgb(59, 130, 246) 0%, rgba(59, 130, 246, 0) 100%)', transform: 'rotate(30deg)' }} />
      </div>

      <div className="flex items-center justify-between px-6 h-16 border-b border-white/10 bg-[#030712]/50 backdrop-blur-xl relative z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center text-white">
              <Zap className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-white">Offer<span className="text-brand-blue">IQ</span> Admin</span>
          </div>
          <div className="flex items-center gap-4 ml-4">
            <Link href="/admin" className="text-white/50 hover:text-white text-sm font-medium py-5">Templates</Link>
            <Link href="/admin/users" className="text-white text-sm font-medium border-b-2 border-brand-blue py-5">Users</Link>
          </div>
        </div>
        <Link href="/" className="text-white/50 hover:text-white transition-colors text-sm font-medium">Back to App</Link>
      </div>

      <main className="flex-1 overflow-y-auto p-8 relative z-10">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">User Management</h1>
              <p className="text-white/50 mt-1 text-sm">Manage users, roles, and agency access.</p>
            </div>
          </div>

          {loading ? (
            <div className="text-white/50 text-center py-20">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="border border-white/10 rounded-2xl p-16 text-center bg-white/[0.02]">
              <User className="w-10 h-10 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white">No users found</h3>
            </div>
          ) : (
            <div className="bg-[#131826] border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm text-white/70">
                <thead className="bg-white/[0.02] border-b border-white/10 text-xs uppercase text-white/50 font-bold">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Joined</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-blue to-purple-500 flex items-center justify-center text-white font-bold">
                            {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium text-white">{user.name || 'Unnamed User'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          className="bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-white/90 text-xs focus:outline-none focus:border-brand-blue"
                          value={user.role || 'user'}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        >
                          <option value="user">User</option>
                          <option value="agency">Agency</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white/50">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-400/10 inline-flex items-center"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
