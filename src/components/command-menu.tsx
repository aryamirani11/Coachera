"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Users, FileBarChart, Upload, Search, Activity } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { supabase } from "@/lib/supabase";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const [athletes, setAthletes] = React.useState<any[]>([]);
  const router = useRouter();

  React.useEffect(() => {
    supabase.from("athletes").select("id, name").then(({ data }) => {
      if (data) setAthletes(data);
    });

    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      {/* Clickable fake input for the Topbar */}
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-72 items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 hover:bg-muted/80 transition-colors"
      >
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="flex-1 text-left text-sm text-muted-foreground">Search anywhere...</span>
        <kbd className="hidden rounded border border-border bg-white px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline-block">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search athletes or jump to pages..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Jump To">
            <CommandItem onSelect={() => runCommand(() => router.push("/upload"))}>
              <Upload className="mr-2 h-4 w-4" />
              <span>Upload New Match</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/athletes"))}>
              <Users className="mr-2 h-4 w-4" />
              <span>Academy Athletes</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/matches"))}>
              <FileBarChart className="mr-2 h-4 w-4" />
              <span>Match Analytics</span>
            </CommandItem>
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="Athletes">
            {athletes.map((ath) => (
              <CommandItem key={ath.id} onSelect={() => runCommand(() => router.push(`/athletes/${ath.id}`))}>
                <Activity className="mr-2 h-4 w-4" />
                <span>{ath.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
