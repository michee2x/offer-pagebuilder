"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap } from "lucide-react";

export function AdminNav() {
  const pathname = usePathname();

  const isOverview = pathname === "/admin";
  const isTemplates = pathname === "/admin/templates";
  const isUsers = pathname === "/admin/users";

  return (
    <div className="flex items-center justify-between px-6 h-16 border-b border-white/10 bg-[#030712]/50 backdrop-blur-xl relative z-10">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center text-white">
            <Zap className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-white">
            Offer<span className="text-brand-blue">IQ</span> Admin
          </span>
        </div>
        <div className="flex items-center gap-4 ml-4">
          <Link
            href="/admin"
            className={`text-sm font-medium py-5 border-b-2 ${
              isOverview
                ? "text-white border-brand-blue"
                : "text-white/50 border-transparent hover:text-white"
            }`}
          >
            Overview
          </Link>
          <Link
            href="/admin/templates"
            className={`text-sm font-medium py-5 border-b-2 ${
              isTemplates
                ? "text-white border-brand-blue"
                : "text-white/50 border-transparent hover:text-white"
            }`}
          >
            Templates
          </Link>
          <Link
            href="/admin/users"
            className={`text-sm font-medium py-5 border-b-2 ${
              isUsers
                ? "text-white border-brand-blue"
                : "text-white/50 border-transparent hover:text-white"
            }`}
          >
            Users
          </Link>
        </div>
      </div>
      <Link
        href="/"
        className="text-white/50 hover:text-white transition-colors text-sm font-medium"
      >
        Back to App
      </Link>
    </div>
  );
}
