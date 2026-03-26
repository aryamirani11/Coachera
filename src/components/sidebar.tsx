"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  FileBarChart,
  Settings,
  Activity,
  Upload,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Athletes", href: "/athletes", icon: Users },
  { label: "Matches", href: "/matches", icon: FileBarChart },
  { label: "Upload Match", href: "/upload", icon: Upload },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ 
  isCollapsed, 
  setIsCollapsed 
}: { 
  isCollapsed: boolean; 
  setIsCollapsed: (val: boolean) => void 
}) {
  const pathname = usePathname();

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 68 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground overflow-visible"
    >
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar hover:bg-sidebar-accent text-white shadow-sm transition-colors z-50"
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Logo */}
      <div className={`flex h-16 items-center ${isCollapsed ? 'justify-center px-0' : 'justify-start gap-2.5 px-6'}`}>
        <div className="flex h-8 w-8 min-w-[32px] items-center justify-center rounded-lg bg-electric">
          <Activity className="h-4.5 w-4.5 text-white" />
        </div>
        {!isCollapsed && (
          <motion.span 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-lg font-semibold tracking-tight text-white whitespace-nowrap"
          >
            Coachera
          </motion.span>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isCollapsed ? 'justify-center' : 'gap-3 justify-start'
              } ${
                isActive
                  ? "bg-sidebar-accent text-white shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white"
              }`}
            >
              <item.icon className="h-4.5 w-4.5 min-w-[18px]" />
              {!isCollapsed && (
                <span className="whitespace-nowrap">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`border-t border-sidebar-border py-4 transition-all ${isCollapsed ? 'px-3 flex justify-center' : 'px-4'}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="flex h-8 w-8 min-w-[32px] items-center justify-center rounded-full bg-electric/20 text-xs font-semibold text-electric-light">
            EA
          </div>
          {!isCollapsed && (
            <div className="flex flex-col whitespace-nowrap overflow-hidden">
              <span className="text-xs font-medium text-white truncate">
                Elite Academy
              </span>
              <span className="text-[11px] text-sidebar-foreground/50">
                Pro Plan
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
