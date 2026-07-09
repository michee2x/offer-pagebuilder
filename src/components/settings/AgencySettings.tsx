"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

type SubUser = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

export function AgencySettings() {
  const [subUsers, setSubUsers] = useState<SubUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    fetchSubUsers();
  }, []);

  const fetchSubUsers = async () => {
    try {
      const res = await fetch("/api/agency/sub-users");
      if (res.status === 403) {
        toast.error("You need an Agency plan to access this feature.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.subUsers) {
        setSubUsers(data.subUsers);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/agency/sub-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to create account");

      toast.success("Sub-account created successfully");
      setName("");
      setEmail("");
      setPassword("");
      fetchSubUsers();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this sub-account? They will lose access immediately.")) return;

    try {
      const res = await fetch(`/api/agency/sub-users?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");

      toast.success("Sub-account removed");
      fetchSubUsers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Agency Clients</h2>
        <p className="text-white/50 text-sm mt-1">
          Manage sub-accounts for your clients. You have {20 - subUsers.length} spots remaining.
        </p>
      </div>

      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[#555] mb-6">Create Sub-Account</h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/70">Client Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-blue"
                placeholder="e.g. Acme Corp"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/70">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-blue"
                placeholder="client@acme.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/70">Initial Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-blue"
              placeholder="••••••••"
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || subUsers.length >= 20}
              className="h-12 px-6 rounded-xl bg-brand-blue text-white font-bold flex items-center justify-center gap-2 hover:bg-brand-blue/90 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {isSubmitting ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[#555]">Active Clients ({subUsers.length}/20)</h3>
        
        {subUsers.length === 0 ? (
          <div className="border border-white/10 border-dashed rounded-2xl p-12 text-center text-white/30">
            <Users className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No client sub-accounts created yet.</p>
          </div>
        ) : (
          <div className="bg-[#131826] border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/10">
            {subUsers.map((user) => (
              <div key={user.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-white">{user.name}</div>
                    <div className="text-xs text-white/50">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-xs text-white/30 hidden md:block">
                    Added {new Date(user.created_at).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="w-8 h-8 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
