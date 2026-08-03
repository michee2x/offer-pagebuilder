"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User, Mail, Briefcase, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export function ProfileSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
  });

  // Password change state
  const [pwData, setPwData] = useState({ current: "", next: "", confirm: "" });
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user");
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        setFormData({
          name: data.user?.name || "",
          email: data.user?.email || "",
          role: data.user?.role || "",
        });
      } catch (err) {
        console.error(err);
        toast.error("Could not load profile data");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, role: formData.role }),
      });
      
      if (!res.ok) throw new Error("Update failed");
      
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwData.current) {
      toast.error("Please enter your current password");
      return;
    }
    if (pwData.next.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (pwData.next !== pwData.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setIsChangingPw(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwData.current, newPassword: pwData.next }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      toast.success("Password updated successfully");
      setPwData({ current: "", next: "", confirm: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setIsChangingPw(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-white tracking-tight">Personal Profile</h1>
          <p className="text-[#555] text-sm">Manage your identity and role within the platform.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label className="text-[#999] text-xs font-semibold ml-1">Full Name</Label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#444] group-focus-within:text-brand-blue transition-colors">
                <User className="w-4 h-4" />
              </div>
              <Input 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="pl-11 h-12 bg-white/5 backdrop-blur-md border-white/5 focus:border-brand-blue/40 transition-all rounded-xl text-white" 
                placeholder="Enter your name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#999] text-xs font-semibold ml-1">Email Address</Label>
            <div className="relative group opacity-60">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#444]">
                <Mail className="w-4 h-4" />
              </div>
              <Input 
                value={formData.email}
                disabled
                className="pl-11 h-12 bg-white/5 backdrop-blur-md border-white/5 rounded-xl cursor-not-allowed text-white" 
                placeholder="email@example.com"
              />
            </div>
            <p className="text-[10px] text-[#333] ml-1">Email cannot be changed directly.</p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-[#999] text-xs font-semibold ml-1">Job Title / Role</Label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#444] group-focus-within:text-brand-blue transition-colors">
                <Briefcase className="w-4 h-4" />
              </div>
              <Input 
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
                className="pl-11 h-12 bg-white/5 backdrop-blur-md border-white/5 focus:border-brand-blue/40 transition-all rounded-xl text-white" 
                placeholder="e.g. Founder, Marketing Lead"
              />
            </div>
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

      {/* ── Change Password ───────────────────────────────────────────── */}
      <section className="border-t border-white/5 pt-10">
        <div className="flex flex-col gap-1 mb-8">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#555]" />
            Change Password
          </h2>
          <p className="text-[#555] text-sm">Update your password. You&apos;ll need to enter your current password to confirm.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current password */}
          <div className="space-y-2 md:col-span-2">
            <Label className="text-[#999] text-xs font-semibold ml-1">Current Password</Label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#444] group-focus-within:text-brand-blue transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <Input
                type={showCurrent ? "text" : "password"}
                value={pwData.current}
                onChange={e => setPwData({ ...pwData, current: e.target.value })}
                className="pl-11 pr-11 h-12 bg-white/5 backdrop-blur-md border-white/5 focus:border-brand-blue/40 transition-all rounded-xl text-white"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#444] hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="space-y-2">
            <Label className="text-[#999] text-xs font-semibold ml-1">New Password</Label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#444] group-focus-within:text-brand-blue transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <Input
                type={showNext ? "text" : "password"}
                value={pwData.next}
                onChange={e => setPwData({ ...pwData, next: e.target.value })}
                className="pl-11 pr-11 h-12 bg-white/5 backdrop-blur-md border-white/5 focus:border-brand-blue/40 transition-all rounded-xl text-white"
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowNext(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#444] hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showNext ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm new password */}
          <div className="space-y-2">
            <Label className="text-[#999] text-xs font-semibold ml-1">Confirm New Password</Label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#444] group-focus-within:text-brand-blue transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <Input
                type={showNext ? "text" : "password"}
                value={pwData.confirm}
                onChange={e => setPwData({ ...pwData, confirm: e.target.value })}
                className={`pl-11 h-12 bg-white/5 backdrop-blur-md border-white/5 focus:border-brand-blue/40 transition-all rounded-xl text-white ${
                  pwData.confirm && pwData.confirm !== pwData.next ? "border-red-500/50 focus:border-red-500/50" : ""
                }`}
                placeholder="Repeat new password"
              />
            </div>
            {pwData.confirm && pwData.confirm !== pwData.next && (
              <p className="text-[10px] text-red-400 ml-1">Passwords do not match</p>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleChangePassword}
            disabled={isChangingPw}
            className="h-11 px-8 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white font-bold transition-all hover:shadow-[0_8px_24px_rgba(139,92,246,0.25)] active:scale-95 border-0"
          >
            {isChangingPw ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </section>
    </div>
  );
}
