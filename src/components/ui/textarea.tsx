import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[120px] w-full rounded-xl border border-white/5 bg-[#0a0a0a] px-4 py-3 text-sm transition-all outline-none placeholder:text-zinc-600 focus:border-brand-yellow/30 focus:bg-[#0d0d0d] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
