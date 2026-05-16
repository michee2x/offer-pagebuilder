"use client";

import React from "react";
import { MoreVertical, ExternalLink, Trash2, Link2, Eye } from "lucide-react";
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

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (confirm("Are you sure you want to delete this campaign?")) {
      try {
        const response = await fetch(`/api/builder/pages/${funnel.id}`, {
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
      }
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const url = `${window.location.origin}/funnels/${funnel.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  return (
    <div 
      className="group cursor-pointer"
      onClick={() => router.push(`/funnels/${funnel.id}`)}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/funnels/${funnel.id}`);
                  }}
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
