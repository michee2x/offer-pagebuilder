import { DocsSidebar } from "@/components/docs/DocsSidebar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#050505]">
      {/* Left Sidebar */}
      <div className="hidden md:flex h-full overflow-hidden">
        <DocsSidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-12 shrink-0 border-b border-white/[0.06] bg-[#07080f]/80 backdrop-blur-sm flex items-center px-6 gap-4">
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

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
