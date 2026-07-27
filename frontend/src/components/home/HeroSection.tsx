"use client";

import { useState } from "react";
import Image from "next/image";
import { BRAND } from "@/lib/brand";

export interface HeroProduct {
  id: string | number;
  name: string;
  price: number;
  description: string;
  image: string;
  thumbnails: string[];
  sizes: number[];
  colors: string[]; // hex values
  currency?: string;
}

const COLOR_IMAGES = [
  { color: "#000000", image: "/products/speed-turf-black.png", label: "Black" },
  { color: "#2563eb", image: "/products/speed-turf-main.png", label: "Blue" },
  { color: "#dc2626", image: "/products/speed-turf-red.png", label: "Red" },
  { color: "#16a34a", image: "/products/speed-turf-green.png", label: "Green" },
];

const DEFAULT_PRODUCT: HeroProduct = {
  id: "spotlight-1",
  name: "Speed Turf Blue",
  price: 17999,
  description:
    "A bold silhouette built for comfort as much as speed. Reinforced construction and a padded strap keep the fit locked in all day.",
  image: COLOR_IMAGES[1].image,
  thumbnails: COLOR_IMAGES.map((c) => c.image),
  sizes: [40, 41, 42, 43],
  colors: COLOR_IMAGES.map((c) => c.color),
  currency: BRAND.currency,
};

export default function HeroSection({ product = DEFAULT_PRODUCT }: { product?: HeroProduct }) {
  const [activeSize, setActiveSize] = useState(product.sizes[Math.floor(product.sizes.length / 2)]);
  const [activeColorIdx, setActiveColorIdx] = useState(1); // default to Blue

  // Derive the active image from the selected color
  const activeImage = COLOR_IMAGES[activeColorIdx]?.image ?? product.image;

  return (
    <section
      style={{ backgroundColor: BRAND.colors.primary }}
      className="relative overflow-hidden"
    >
      {/* Oversized background wordmark — purely decorative */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-4 top-1/2 -translate-y-1/2 select-none text-[13rem] font-black italic leading-none text-white/10 md:text-[16rem]"
      >
        Just Do It
      </span>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-20">
        {/* Product image + thumbnail rail */}
        <div className="relative z-10">
          <div className="relative mx-auto aspect-[5/3] w-full max-w-2xl">
            <Image
              src={activeImage}
              alt={COLOR_IMAGES[activeColorIdx]?.label ?? product.name}
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
          <div className="mt-6 flex justify-center gap-4">
            {COLOR_IMAGES.map((c, i) => (
              <button
                key={c.image}
                onClick={() => setActiveColorIdx(i)}
                className={`h-18 w-24 overflow-hidden rounded-lg border-2 bg-white/90 transition ${
                  activeColorIdx === i ? "border-white" : "border-transparent opacity-70"
                }`}
              >
                <div className="relative h-full w-full">
                  <Image src={c.image} alt={c.label} fill className="object-contain p-1" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Product info */}
        <div className="relative z-10 text-white">
          <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">{product.name}</h1>
          <p className="mt-2 text-2xl font-bold">
            {product.currency}
            {product.price.toLocaleString()}
          </p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/90">{product.description}</p>

          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/80">Size</p>
            <div className="flex gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setActiveSize(size)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition"
                  style={
                    activeSize === size
                      ? { backgroundColor: "white", color: BRAND.colors.primary }
                      : { backgroundColor: "transparent", color: "white" }
                  }
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/80">Color</p>
            <div className="flex gap-3">
              {COLOR_IMAGES.map((c, i) => (
                <button
                  key={c.color}
                  onClick={() => setActiveColorIdx(i)}
                  aria-label={c.label}
                  style={{ backgroundColor: c.color }}
                  className={`h-7 w-7 rounded-full border-2 transition ${
                    activeColorIdx === i ? "border-white scale-110" : "border-white/40"
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            style={{ backgroundColor: BRAND.colors.primaryDark }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRAND.colors.primaryDarker)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND.colors.primaryDark)}
            className="mt-8 rounded-full px-10 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition"
          >
            Buy now
          </button>
        </div>
      </div>
    </section>
  );
}