"use client";

import Image from "next/image";
import Link from "next/link";

export default function WishlistPage() {
  const items: never[] = [];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <h1 className="text-3xl font-heading font-bold text-text mb-8">My Wishlist</h1>

      {items.length === 0 ? (
        <div className="bg-card border border-border rounded-[var(--radius-lg)] p-12 text-center">
          <div className="relative w-40 h-32 mx-auto mb-6">
            <Image
              src="/images/empty-wishlist.svg"
              alt="Empty wishlist"
              fill
              className="object-contain"
              sizes="160px"
            />
          </div>
          <h2 className="text-xl font-heading font-semibold text-text mb-2">Your wishlist is empty</h2>
          <p className="text-text-secondary mb-6">Save items you love by clicking the heart icon.</p>
          <Link href="/shop">
            <span className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-[var(--radius-sm)] font-medium text-sm hover:bg-primary/90 transition-colors">
              Explore Products
            </span>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
