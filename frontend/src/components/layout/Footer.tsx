"use client";

import Link from "next/link";
import { Hash, Globe, Video, Camera } from "lucide-react";
import { BRAND } from "@/lib/brand";

const COLUMNS = [
  {
    title: "Store locator",
    links: ["Subscribe to newsletter", "Create account", "Site feedback"],
  },
  {
    title: "Help",
    links: ["Order status", "Shipping", "Returns", "Ways to pay", "Contact us"],
  },
  {
    title: "About",
    links: ["News", "Careers", "Investors"],
  },
];

const SOCIALS = [
  { icon: Hash, label: "Twitter" },
  { icon: Globe, label: "Facebook" },
  { icon: Video, label: "YouTube" },
  { icon: Camera, label: "Instagram" },
];

export default function Footer() {
  return (
    <footer style={{ backgroundColor: BRAND.colors.dark }} className="text-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-sm font-bold uppercase tracking-wide">{col.title}</p>
              <ul className="space-y-2 text-sm text-white/70">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="transition hover:text-white">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="flex items-start gap-4 md:justify-end">
            {SOCIALS.map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} {BRAND.name}, Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="transition hover:text-white">
              Terms of use
            </Link>
            <Link href="#" className="transition hover:text-white">
              Privacy policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}