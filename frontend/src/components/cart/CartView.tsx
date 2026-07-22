"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui";
import { Trash2, Minus, Plus, ArrowLeft } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cart";
import { getProductPlaceholder } from "@/lib/placeholders";

export function CartView() {
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="relative w-40 h-32 mx-auto mb-8">
          <Image
            src="/images/empty-cart.svg"
            alt="Empty cart"
            fill
            className="object-contain"
            sizes="160px"
          />
        </div>
        <h2 className="text-2xl font-heading font-bold text-text mb-2">Your cart is empty</h2>
        <p className="text-text-secondary mb-8">Looks like you haven&apos;t added anything yet</p>
        <Link href="/shop">
          <Button size="lg">
            <ArrowLeft size={18} className="mr-2" />
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => (
          <div
            key={item.variant_id}
            className="flex gap-4 bg-card border border-border rounded-[var(--radius-lg)] p-4"
          >
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-border/30 to-border/10 rounded-[var(--radius-sm)] overflow-hidden shrink-0">
              {item.product_image_url ? (
                <Image src={item.product_image_url} alt={item.product_name} fill className="object-cover" sizes="112px" />
              ) : (
                <Image
                  src={getProductPlaceholder(item.product_name)}
                  alt={item.product_name}
                  fill
                  className="object-cover p-3"
                  sizes="112px"
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <Link href={`/shop/${item.product_slug}`}>
                <h3 className="font-heading font-semibold text-text hover:text-primary transition-colors line-clamp-1">
                  {item.product_name}
                </h3>
              </Link>
              <p className="text-xs text-text-secondary mt-0.5">
                {(() => { try { const a = JSON.parse(item.attributes); return Object.entries(a).map(([k, v]) => `${k}: ${v}`).join(", "); } catch { return ""; }})()}
              </p>

              <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                <span className="font-heading font-bold text-text">{formatPrice(item.price)}</span>

                <div className="flex items-center border border-border rounded-[var(--radius-sm)]">
                  <button
                    onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                    className="p-1.5 hover:bg-border/50 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                    className="p-1.5 hover:bg-border/50 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-heading font-semibold text-text min-w-[70px] text-right">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                  <button
                    onClick={() => removeItem(item.variant_id)}
                    className="p-1.5 text-text-secondary hover:text-danger transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="lg:col-span-1">
        <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6 space-y-4 sticky top-28">
          <h3 className="font-heading font-semibold text-lg text-text">Order Summary</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Subtotal</span>
              <span className="text-text font-medium">{formatPrice(getTotal())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Shipping</span>
              <span className="text-text font-medium">{getTotal() >= 50 ? "Free" : formatPrice(9.99)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Tax</span>
              <span className="text-text font-medium">{formatPrice(getTotal() * 0.08)}</span>
            </div>
            <hr className="border-border" />
            <div className="flex justify-between text-base">
              <span className="font-heading font-semibold text-text">Total</span>
              <span className="font-heading font-bold text-primary">
                {formatPrice(getTotal() + (getTotal() >= 50 ? 0 : 9.99) + getTotal() * 0.08)}
              </span>
            </div>
          </div>

          <Link href="/checkout">
            <Button size="lg" className="w-full">
              Proceed to Checkout
            </Button>
          </Link>

          <Link href="/shop" className="block text-center text-sm text-primary hover:text-primary-hover transition-colors">
            <ArrowLeft size={14} className="inline mr-1" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
