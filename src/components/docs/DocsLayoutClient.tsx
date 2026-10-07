"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function DocsLayoutClient({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505]">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:flex h-full overflow-hidden shrink-0">
        <DocsSidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-12 shrink-0 border-b border-white/[0.06] bg-[#07080f]/80 backdrop-blur-sm flex items-center px-4 gap-3">
          {/* Mobile hamburger — only visible below md */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06] transition-all"
                aria-label="Open navigation"
              >
                <Menu className="w-4 h-4" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              showCloseButton={false}
              className="p-0 w-[272px] border-r border-white/[0.06] bg-[#07080f]"
            >
              {/* Wrap sidebar — clicking a nav item closes the sheet */}
              <div onClick={() => setOpen(false)} className="h-full">
                <DocsSidebar />
              </div>
            </SheetContent>
          </Sheet>

          {/* OfferIQ wordmark on mobile (where sidebar logo is hidden) */}
          <span className="md:hidden text-white font-bold text-sm">
            Offer<span className="text-brand-blue">IQ</span>{" "}
            <span className="text-white/30 font-normal text-xs">Docs</span>
          </span>

          <div className="flex-1" />

          <a
            href="https://app.ofiq.app"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-white/40 hover:text-white/70 transition-colors hidden sm:block"
          >
            Open App →
          </a>
          <a
            href="mailto:support@ofiq.app"
            className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 transition-all"
          >
            Support
          </a>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
