"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  UserPlus, 
  MoreHorizontal, 
  Shield, 
  User, 
  Mail,
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

interface TeamSettingsProps {
  workspace: any;
}

export function TeamSettings({ workspace }: TeamSettingsProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    if (!workspace) return;
    
    async function fetchMembers() {
      try {
        const res = await fetch(`/api/workspaces/members?workspaceId=${workspace.id}`);
        if (!res.ok) throw new Error("Failed to load members");
        const data = await res.json();
        setMembers(data.members || []);
      } catch (err) {
        console.error(err);
        toast.error("Could not load team members");
      } finally {
        setIsLoading(false);
      }
    }
    fetchMembers();
  }, [workspace]);

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setIsInviting(true);
    try {
      // In a real app, this would be a POST to /api/workspaces/members/invite
      await new Promise(r => setTimeout(r, 800));
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
    } catch (err) {
      toast.error("Failed to send invitation");
    } finally {
      setIsInviting(false);
    }
  };

  if (!workspace) return null;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section>
        <div className="flex flex-col gap-1 mb-10">
          <h1 className="text-2xl font-bold text-white tracking-tight">Team & Access</h1>
          <p className="text-[#555] text-sm">Manage who has access to this workspace and their permissions.</p>
        </div>

        {/* Invite Form */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-12">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#444] group-focus-within:text-brand-yellow transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <Input 
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                className="pl-11 h-12 bg-black border-white/5 focus:border-brand-yellow/40 transition-all rounded-xl" 
                placeholder="colleague@example.com"
              />
            </div>
            <Button 
              onClick={handleInvite}
              disabled={isInviting || !inviteEmail}
              className="h-12 px-6 rounded-xl bg-brand-yellow hover:bg-brand-yellow/90 text-black font-bold transition-all active:scale-95 shrink-0"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          </div>
        </div>

        {/* Members List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#555]">Team Members ({members.length})</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#555]">Role</span>
          </div>
          
          <div className="bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden">
            {members.map((member, i) => {
              const user = member.users;
              const name = user?.name || "Unknown User";
              const email = user?.email || "No email";
              const initial = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
              
              return (
                <div 
                  key={member.user_id} 
                  className={cn(
                    "flex items-center justify-between p-4 transition-colors hover:bg-white/[0.02]",
                    i !== members.length - 1 && "border-b border-white/5"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                      {initial}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{name}</span>
                      </div>
                      <span className="text-xs text-[#555]">{email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 min-w-[100px]">
                      {member.role === "owner" ? (
                        <ShieldCheck className="w-3.5 h-3.5 text-brand-yellow" />
                      ) : member.role === "admin" ? (
                        <Shield className="w-3.5 h-3.5 text-white/40" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-white/20" />
                      )}
                      <span className="text-xs font-medium text-white/70 capitalize">{member.role}</span>
                    </div>
                    
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-[#444] hover:text-white">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
