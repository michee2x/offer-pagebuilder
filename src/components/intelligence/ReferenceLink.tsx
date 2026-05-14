import React from "react";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import Image from "next/image";

interface ReferenceLinkProps {
  title: string;
  url: string;
  domain: string;
  className?: string;
}

export function ReferenceLink({ title, url, domain, className }: ReferenceLinkProps) {
  // Use a reliable favicon service
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-3 py-2 px-3 my-2 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors duration-200 group no-underline",
        className
      )}
    >
      <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 bg-white/10 flex items-center justify-center">
        <Image 
          src={faviconUrl} 
          alt={domain} 
          width={24}
          height={24}
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="flex flex-col">
        <span className="text-[13px] font-semibold text-white/90 leading-none mb-1 group-hover:text-brand-yellow transition-colors">
          {title}
        </span>
        <span className="text-[11px] font-medium text-white/50 leading-none flex items-center gap-1">
          {domain}
          <ExternalLink className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
        </span>
      </div>
    </a>
  );
}
