"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Eye, ShoppingBag } from "lucide-react";
import { BRAND } from "@/lib/brand";

export interface ProductCardData {
  id: string | number;
  name: string;
  price: number;
  image: string;
  currency?: string;
}

export default function ProductCard({ product }: { product: ProductCardData }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={hovered ? { backgroundColor: BRAND.colors.primary, borderColor: "transparent" } : undefined}
      className={`group relative flex flex-col items-center rounded-xl border p-6 text-center transition ${
        hovered ? "text-white shadow-xl" : "border-slate-100 bg-white"
      }`}
    >
      <div className="relative aspect-square w-full">
        <Image src={product.image} alt={product.name} fill className="object-contain" />
      </div>

      {hovered ? (
        <div className="mt-3 w-full">
          <div className="flex items-center justify-center gap-3">
            <button
              aria-label="Add to cart"
              style={{ color: BRAND.colors.primary }}
              className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide transition hover:bg-white/90"
            >
              Buy
            </button>
            <button aria-label="Add to wishlist" className="text-white/90 transition hover:text-white">
              <Heart size={18} />
            </button>
            <button aria-label="Quick view" className="text-white/90 transition hover:text-white">
              <Eye size={18} />
            </button>
          </div>
          <p className="mt-3 text-sm font-semibold">{product.name}</p>
          <p className="text-sm font-bold">
            {product.currency ?? BRAND.currency}
            {product.price.toLocaleString()}
          </p>
        </div>
      ) : (
        <p className="mt-3 text-sm font-medium text-slate-700">{product.name}</p>
      )}
    </div>
  );
}