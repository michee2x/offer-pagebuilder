"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, Loader2, ArrowRight } from "lucide-react";

interface Funnel {
  id: string;
  name: string;
  domain?: string;
  workspaceName?: string;
}

interface FunnelSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FunnelSwitcher({ isOpen, onClose }: FunnelSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [navigatingId, setNavigatingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      onClose();
      setNavigatingId(null);
    }
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      if (funnels.length === 0) {
        fetchFunnels();
      }
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const fetchFunnels = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/workspaces");
      if (res.ok) {
        const data = await res.json();
        const allFunnels: Funnel[] = [];
        data.workspaces?.forEach((ws: any) => {
          ws.builder_pages?.forEach((page: any) => {
            allFunnels.push({
              id: page.id,
              name: page.name,
              domain: ws.domain,
              workspaceName: ws.name,
            });
          });
        });
        setFunnels(allFunnels);
      }
    } catch (e) {
      console.error("Failed to fetch funnels for switcher", e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = funnels.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]">
      {/* Opaque dark background without blur */}
      <div 
        className="fixed inset-0 bg-[#030712]/95" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-xl bg-[#131826] border border-white/10 shadow-2xl rounded-2xl overflow-hidden flex flex-col">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-white/10 bg-white/[0.02]">
          <Search className="w-5 h-5 text-white/40 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search funnels..."
            className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/30 text-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
               if (e.key === 'Enter' && filtered.length > 0) {
                 const targetId = filtered[0].id;
                 setNavigatingId(targetId);
                 router.push(`/funnels/${targetId}`);
               }
            }}
          />
          <div className="flex items-center gap-1.5 shrink-0 ml-3">
            <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-white/50">ESC</kbd>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-brand-blue animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-white/40 text-sm">
              No funnels found.
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((funnel) => (
                <button
                  key={funnel.id}
                  onClick={() => {
                    setNavigatingId(funnel.id);
                    router.push(`/funnels/${funnel.id}`);
                  }}
                  disabled={navigatingId !== null}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.06] transition-colors group text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div>
                    <h4 className="text-white font-medium text-sm mb-0.5">{funnel.name}</h4>
                    <p className="text-white/40 text-xs">{funnel.workspaceName} {funnel.domain && `• ${funnel.domain}`}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2" style={{ opacity: navigatingId === funnel.id ? 1 : undefined }}>
                     <span className="text-xs text-white/40 font-mono">
                       {navigatingId === funnel.id ? 'Loading...' : 'Jump'}
                     </span>
                     {navigatingId === funnel.id ? (
                       <Loader2 className="w-4 h-4 text-brand-blue animate-spin" />
                     ) : (
                       <ArrowRight className="w-4 h-4 text-brand-blue" />
                     )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
