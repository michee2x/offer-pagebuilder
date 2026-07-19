"use client";

import React, { useState, useTransition } from "react";
import { MoreVertical, ExternalLink, Trash2, Link2, Eye, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function CampaignCard({ funnel }: { funnel: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (confirm("Are you sure you want to delete this campaign?")) {
      setIsDeleting(true);
      try {
        const response = await fetch(`/api/funnels/${funnel.id}`, {
          method: "DELETE",
        });
        
        if (response.ok) {
          toast.success("Campaign deleted successfully");
          router.refresh();
        } else {
          toast.error("Failed to delete campaign");
        }
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("An error occurred");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleNavigate = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    startTransition(() => {
      router.push(`/funnels/${funnel.id}`);
    });
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    let url = "";
    if (funnel.custom_domain) {
      url = `https://${funnel.custom_domain}`;
    } else if (funnel.subdomain) {
      const isLocal = window.location.hostname.includes("localhost");
      const protocol = isLocal ? "http://" : "https://";
      const base = isLocal ? "localhost:3000" : "ofiq.app";
      url = `${protocol}${funnel.subdomain}.${base}`;
    } else {
      url = `${window.location.origin}/p/${funnel.id}`;
    }

    navigator.clipboard.writeText(url);
    toast.success("Deployed link copied to clipboard");
  };

  return (
    <div 
      className={`group cursor-pointer ${isPending || isDeleting ? 'pointer-events-none opacity-80' : ''}`}
      onClick={handleNavigate}
    >
      <div className="flex flex-col">
        {/* Image Container - Exact Gallereee Style */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/5 bg-[#030712] mb-4 transition-all duration-500 group-hover:border-white/20 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {funnel.og_image_url ? (
            <img
              src={funnel.og_image_url}
              alt={funnel.name}
              className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-[1.05]"
            />
          ) : (
            <img
              src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop"
              alt="Empty state"
              className="object-cover w-full h-full opacity-40 transition-transform duration-700 group-hover:scale-[1.05]"
            />
          )}
          
          {/* Loading Overlay */}
          {(isPending || isDeleting) && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40 flex flex-col items-center justify-center text-white">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <span className="text-sm font-medium">{isDeleting ? 'Deleting...' : 'Loading...'}</span>
            </div>
          )}
          
          {/* Floating Action Menu (Replacing the badge) */}
          <div className="absolute bottom-4 right-4 z-30">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <button className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 group/btn">
                  <MoreVertical className="w-5 h-5 text-black transition-transform group-hover/btn:rotate-90" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-[#1a1a1a] border-white/10 text-white p-1.5 rounded-xl backdrop-blur-xl">
                <DropdownMenuItem 
                  onClick={handleNavigate}
                  disabled={isPending || isDeleting}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span className="font-medium">Open Project</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <Link2 className="w-4 h-4 text-purple-400" />
                  <span className="font-medium">Copy URL</span>
                </DropdownMenuItem>
                <div className="h-[1px] bg-white/5 my-1" />
                <DropdownMenuItem 
                  onClick={handleDelete}
                  disabled={isPending || isDeleting}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-red-500/20 text-red-400 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="font-medium">Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Text Below */}
        <div className="flex flex-col px-1">
          <h3 className="text-[16px] font-semibold text-white/90 group-hover:text-white transition-colors">
            {funnel.name}
          </h3>
          <span className="text-[12px] text-white/30 mt-1 uppercase tracking-wider font-medium">
            Updated {new Date(funnel.updated_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
