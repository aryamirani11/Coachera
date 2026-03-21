"use client";

import { Bell, ChevronDown, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white/80 px-8 backdrop-blur-md">
      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-72 items-center gap-2 rounded-lg border border-border bg-muted/50 px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search athletes, matches..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden rounded border border-border bg-white px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline-block">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-muted">
          <Bell className="h-4.5 w-4.5 text-muted-foreground" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-electric" />
        </button>

        {/* Profile */}
        <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary text-[11px] text-primary-foreground">
              CM
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">Coach Mirani</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
