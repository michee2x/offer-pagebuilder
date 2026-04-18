"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function WorkspaceSwitcher({ 
  workspaces, 
  activeId 
}: { 
  workspaces: any[]; 
  activeId: string | null;
}) {
  const router = useRouter();

  if (!workspaces || workspaces.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mr-2">
      <span className="text-sm font-medium text-muted-foreground mr-1">Workspace:</span>
      <Select 
        value={activeId || ""} 
        onValueChange={(val) => {
          router.push(`/?workspace=${val}`);
        }}
      >
        <SelectTrigger className="w-[180px] h-8 text-xs font-semibold bg-primary/5 border-primary/20 hover:bg-primary/10">
          <SelectValue placeholder="Select workspace" />
        </SelectTrigger>
        <SelectContent>
          {workspaces.map((w) => (
            <SelectItem key={w.id} value={w.id}>
              {w.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
