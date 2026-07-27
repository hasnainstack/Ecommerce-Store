"use client";

import Link from "next/link";
import { Search, ShoppingBag } from "lucide-react";
import { BRAND } from "@/lib/brand";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Shop", href: "/shop" },
  { label: "Sale", href: "/shop?sale=true" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  return (
    <header style={{ backgroundColor: BRAND.colors.primary }} className="text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          {/* Swap for your own logo asset in /lib/brand.ts */}
          <span className="text-xl font-black italic tracking-tight">{BRAND.name}</span>
        </Link>

        <nav className="hidden gap-8 text-sm font-medium uppercase tracking-wide md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="opacity-90 transition hover:opacity-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <button aria-label="Search" className="opacity-90 transition hover:opacity-100">
            <Search size={20} />
          </button>
          <Link href="/cart" aria-label="Cart" className="opacity-90 transition hover:opacity-100">
            <ShoppingBag size={20} />
          </Link>
        </div>
      </div>
    </header>
  );
}