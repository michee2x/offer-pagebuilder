import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-12 w-full rounded-xl border border-white/5 bg-[#0a0a0a] px-4 py-2 text-sm transition-all outline-none placeholder:text-zinc-600 focus:border-brand-yellow/30 focus:bg-[#0d0d0d] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
