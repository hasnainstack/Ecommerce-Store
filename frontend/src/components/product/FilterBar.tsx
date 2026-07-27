"use client";

import { useState } from "react";
import { BRAND } from "@/lib/brand";

export interface ProductFilters {
  size: number;
  priceMin: number;
  priceMax: number;
  color: string | null;
}

const COLORS = BRAND.colors.swatches;

export default function FilterBar({
  onChange,
  minPrice = 10000,
  maxPrice = 25000,
  minSize = 36,
  maxSize = 46,
}: {
  onChange?: (filters: ProductFilters) => void;
  minPrice?: number;
  maxPrice?: number;
  minSize?: number;
  maxSize?: number;
}) {
  const [size, setSize] = useState(41);
  const [priceMin, setPriceMin] = useState(minPrice);
  const [priceMax, setPriceMax] = useState(maxPrice);
  const [color, setColor] = useState<string | null>(null);

  const emit = (next: Partial<ProductFilters>) => {
    const merged = { size, priceMin, priceMax, color, ...next };
    onChange?.(merged as ProductFilters);
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col items-start gap-10 px-6 py-6 md:flex-row md:items-center md:gap-16">
      {/* Size slider */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-slate-500">Size</span>
        <div className="flex items-center gap-3">
          <span style={{ backgroundColor: BRAND.colors.primary }}
            className="flex h-8 w-10 items-center justify-center rounded-full text-xs font-bold text-white">
            {size}
          </span>
          <input
            type="range"
            min={minSize}
            max={maxSize}
            value={size}
            onChange={(e) => {
              const v = Number(e.target.value);
              setSize(v);
              emit({ size: v });
            }}
            style={{ accentColor: BRAND.colors.primary }}
            className="w-32"
          />
        </div>
      </div>

      {/* Price range slider */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-slate-500">Price</span>
        <div className="flex items-center gap-3">
          <span style={{ backgroundColor: BRAND.colors.primary }}
            className="flex h-8 items-center justify-center rounded-full px-3 text-xs font-bold text-white">
            {(priceMin / 1000).toFixed(0)}k
          </span>
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            step={1000}
            value={priceMin}
            onChange={(e) => {
              const v = Math.min(Number(e.target.value), priceMax);
              setPriceMin(v);
              emit({ priceMin: v });
            }}
            style={{ accentColor: BRAND.colors.primary }}
            className="w-24"
          />
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            step={1000}
            value={priceMax}
            onChange={(e) => {
              const v = Math.max(Number(e.target.value), priceMin);
              setPriceMax(v);
              emit({ priceMax: v });
            }}
            style={{ accentColor: BRAND.colors.primary }}
            className="w-24"
          />
          <span style={{ backgroundColor: BRAND.colors.primary }}
            className="flex h-8 items-center justify-center rounded-full px-3 text-xs font-bold text-white">
            {(priceMax / 1000).toFixed(0)}k
          </span>
        </div>
      </div>

      {/* Color swatches */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-slate-500">Color</span>
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              aria-label={`Filter by color ${c}`}
              onClick={() => {
                const next = color === c ? null : c;
                setColor(next);
                emit({ color: next });
              }}
              style={{ backgroundColor: c }}
              className={`h-6 w-6 rounded-full border-2 transition ${
                color === c ? "border-slate-900 scale-110" : "border-transparent"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}