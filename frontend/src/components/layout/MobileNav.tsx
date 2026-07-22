"use client";

import Link from "next/link";
import { Heart, ShoppingCart, Home, Search, User } from "lucide-react";
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";
import { usePathname } from "next/navigation";

export function MobileNav() {
  const { getItemCount } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  const links = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/shop", icon: Search, label: "Search" },
    { href: "/cart", icon: ShoppingCart, label: "Cart", badge: getItemCount() },
    { href: "/wishlist", icon: Heart, label: "Wishlist" },
    { href: isAuthenticated() ? "/profile" : "/login", icon: User, label: "Profile" },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {links.map(({ href, icon: Icon, label, badge }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-3 transition-colors ${
                isActive ? "text-primary" : "text-text-secondary"
              }`}
            >
              <div className="relative">
                <Icon size={20} />
                {badge !== undefined && badge > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
