"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Settings, X, ChevronLeft,
  ListChecks, FolderTree,
} from "lucide-react";
import { useUIStore } from "@/stores/ui";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/admin/customers", icon: Users, label: "Customers" },
  { href: "/admin/attributes", icon: ListChecks, label: "Attributes" },
  { href: "/admin/categories", icon: FolderTree, label: "Categories" },
  { href: "#", icon: BarChart3, label: "Analytics" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const content = (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-heading font-bold text-sm">S</span>
          </div>
          <span className="font-heading font-bold text-lg text-text">Admin</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1 hover:bg-border rounded transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-text-secondary hover:text-text hover:bg-border/50"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Back to store */}
      <div className="p-4 border-t border-border">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text transition-colors rounded-[var(--radius-sm)] hover:bg-border/50"
        >
          <ChevronLeft size={16} />
          Back to Store
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-border bg-card">
        {content}
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 h-full bg-card shadow-xl animate-in slide-in-from-left">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
