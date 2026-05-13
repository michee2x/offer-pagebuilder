"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User, Mail, Briefcase } from "lucide-react";
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
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#444] group-focus-within:text-brand-yellow transition-colors">
                <User className="w-4 h-4" />
              </div>
              <Input 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="pl-11 h-12 bg-[#0a0a0a] border-white/5 focus:border-brand-yellow/40 transition-all rounded-xl" 
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
                className="pl-11 h-12 bg-[#0a0a0a] border-white/5 rounded-xl cursor-not-allowed" 
                placeholder="email@example.com"
              />
            </div>
            <p className="text-[10px] text-[#333] ml-1">Email cannot be changed directly.</p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-[#999] text-xs font-semibold ml-1">Job Title / Role</Label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#444] group-focus-within:text-brand-yellow transition-colors">
                <Briefcase className="w-4 h-4" />
              </div>
              <Input 
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
                className="pl-11 h-12 bg-[#0a0a0a] border-white/5 focus:border-brand-yellow/40 transition-all rounded-xl" 
                placeholder="e.g. Founder, Marketing Lead"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="h-11 px-8 rounded-xl bg-brand-yellow hover:bg-brand-yellow/90 text-black font-bold transition-all hover:shadow-[0_8px_24px_rgba(245,166,35,0.25)] active:scale-95"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </section>
    </div>
  );
}
