"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Heart, Search, Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui";
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";
import { useUIStore } from "@/stores/ui";

export function Navbar() {
  const { getItemCount } = useCartStore();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const [searchOpen, setSearchOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Categories", href: "/shop" },
    { label: "About", href: "#" },
    { label: "Contact", href: "#" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-heading font-bold text-sm">S</span>
            </div>
            <span className="font-heading font-bold text-xl text-text">Store</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-text-secondary hover:text-text transition-colors text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 hover:bg-border/50 rounded-lg transition-colors"
              aria-label="Search"
            >
              <Search size={20} className="text-text-secondary" />
            </button>

            <Link
              href="/wishlist"
              className="p-2 hover:bg-border/50 rounded-lg transition-colors hidden sm:block"
              aria-label="Wishlist"
            >
              <Heart size={20} className="text-text-secondary" />
            </Link>

            <Link href="/cart" className="relative p-2 hover:bg-border/50 rounded-lg transition-colors">
              <ShoppingCart size={20} className="text-text-secondary" />
              {getItemCount() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {getItemCount() > 9 ? "9+" : getItemCount()}
                </span>
              )}
            </Link>

            {isAuthenticated() ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link href={user?.role === "admin" ? "/admin" : "/profile"}>
                  <Button variant="ghost" size="sm">
                    <User size={16} className="mr-1.5" />
                    {user?.email?.split("@")[0] || "Profile"}
                  </Button>
                </Link>
                <button onClick={logout} className="p-2 hover:bg-border/50 rounded-lg transition-colors">
                  <LogOut size={18} className="text-text-secondary" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="hidden sm:block">
                <Button size="sm">Login</Button>
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-border/50 rounded-lg transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="pb-4 animate-fadeIn">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full h-11 pl-11 pr-4 bg-border/30 border border-border rounded-[var(--radius-sm)] text-text placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-white animate-fadeIn">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 text-text-secondary hover:text-text hover:bg-border/50 rounded-[var(--radius-sm)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-border my-2" />
            {isAuthenticated() ? (
              <>
                <Link
                  href={user?.role === "admin" ? "/admin" : "/profile"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 text-text-secondary hover:text-text hover:bg-border/50 rounded-[var(--radius-sm)] transition-colors"
                >
                  Profile
                </Link>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="block w-full text-left px-4 py-2.5 text-danger hover:bg-danger/5 rounded-[var(--radius-sm)] transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 text-primary font-medium hover:bg-primary/5 rounded-[var(--radius-sm)] transition-colors"
              >
                Login / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
