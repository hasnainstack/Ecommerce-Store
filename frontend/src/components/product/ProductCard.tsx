"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cart";
import { getProductPlaceholder } from "@/lib/placeholders";
import { useState } from "react";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    base_price: number;
    images?: { url: string; position?: number }[];
    variants?: { id: number; price_override: number | null; stock_qty: number; attributes?: string }[];
    category_id?: number | null;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imgError, setImgError] = useState(false);

  const price = product.variants?.[0]?.price_override ?? product.base_price;
  const oldPrice = product.base_price * 1.3;
  const hasDiscount = price < product.base_price;
  const imageUrl = product.images?.[0]?.url;
  const placeholderSrc = getProductPlaceholder(product.name);
  const inStock = (product.variants?.[0]?.stock_qty ?? 0) > 0;

  return (
    <div className="group bg-card border border-border rounded-[var(--radius-lg)] overflow-hidden transition-all duration-300 hover:shadow-hover">
      {/* Image */}
      <Link href={`/shop/${product.slug}`} className="block relative aspect-square bg-gradient-to-br from-border/30 to-border/10 overflow-hidden">
        {imageUrl && !imgError ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            onError={() => setImgError(true)}
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <Image
            src={placeholderSrc}
            alt={product.name}
            fill
            className="object-cover p-8"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-danger text-white text-[10px] font-bold px-2 py-1 rounded-full">
            -{Math.round((1 - price / oldPrice) * 100)}%
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => { e.preventDefault(); setIsWishlisted(!isWishlisted); }}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white"
        >
          <Heart size={15} className={isWishlisted ? "fill-danger text-danger" : "text-text-secondary"} />
        </button>

        {/* Add to Cart overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
          <Button
            size="sm"
            className="w-full bg-white text-text hover:bg-white/90 shadow-lg text-xs h-9"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              useCartStore.getState().addItem({
                variant_id: product.variants?.[0]?.id ?? product.id,
                product_id: product.id,
                product_name: product.name,
                product_slug: product.slug,
                product_image_url: product.images?.[0]?.url ?? "",
                price: product.variants?.[0]?.price_override ?? product.base_price,
                quantity: 1,
                stock_qty: product.variants?.[0]?.stock_qty ?? 0,
                attributes: product.variants?.[0]?.attributes ?? "{}",
              });
            }}
          >
            <ShoppingCart size={14} className="mr-1.5" />
            Add to Cart
          </Button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <Link href={`/shop/${product.slug}`}>
          <p className="text-xs text-text-secondary mb-1 uppercase tracking-wider">
            {product.category_id ? "Category" : "Product"}
          </p>
          <h3 className="font-heading font-semibold text-text text-sm leading-tight mb-2 line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-0.5 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={12} className={i < 4 ? "text-warning fill-warning" : "text-border"} />
          ))}
          <span className="text-[11px] text-text-secondary ml-1">(42)</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-heading font-bold text-text">{formatPrice(price)}</span>
          {hasDiscount && (
            <span className="text-text-secondary line-through text-xs">{formatPrice(oldPrice)}</span>
          )}
        </div>

        {!inStock && (
          <p className="text-[11px] text-danger mt-1">Out of stock</p>
        )}
      </div>
    </div>
  );
}
