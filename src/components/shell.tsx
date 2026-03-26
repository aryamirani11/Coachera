"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { motion } from "framer-motion";

export function Shell({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <motion.div 
        initial={false}
        animate={{ 
          paddingLeft: isCollapsed ? "68px" : "240px" 
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex flex-1 flex-col"
      >
        <Topbar />
        <main className="flex-1 px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>
      </motion.div>
    </div>
  );
}
