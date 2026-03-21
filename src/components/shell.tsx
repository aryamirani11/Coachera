"use client";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col pl-[240px]">
        <Topbar />
        <main className="flex-1 px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
