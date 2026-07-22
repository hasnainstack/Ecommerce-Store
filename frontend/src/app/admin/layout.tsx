"use client";

import { Sidebar } from "@/components/admin/Sidebar";
import { Menu } from "lucide-react";
import { useUIStore } from "@/stores/ui";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { setSidebarOpen } = useUIStore();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-5rem)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 lg:h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 hover:bg-border rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-heading font-semibold text-text">Admin Dashboard</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-primary">A</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
