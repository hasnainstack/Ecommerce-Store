"use client";

import { useState } from "react";
import Image from "next/image";
import { Button, Badge } from "@/components/ui";
import { Heart, ShoppingCart, Minus, Plus, Star, Truck, Shield, RefreshCw } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getProductPlaceholder } from "@/lib/placeholders";
import { useCartStore } from "@/stores/cart";
import { useRouter } from "next/navigation";

interface ProductDetailProps {
  product: {
    id: number;
    name: string;
    slug: string;
    description: string;
    base_price: number;
    images?: { url: string; position?: number }[];
    variants?: { id: number; price_override: number | null; stock_qty: number; attributes?: string }[];
    category?: { name: string } | null;
  };
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"description" | "reviews" | "specifications">("description");
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = () => {
    if (!variant) return;
    addItem({
      variant_id: variant.id,
      product_id: product.id,
      product_name: product.name,
      product_slug: product.slug,
      product_image_url: product.images?.[0]?.url ?? "",
      price,
      quantity,
      stock_qty: variant.stock_qty,
      attributes: variant.attributes ?? "{}",
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  const variant = product.variants?.[selectedVariant];
  const price = variant?.price_override ?? product.base_price;
  const inStock = (variant?.stock_qty ?? 0) > 0;
  const images = product.images?.length ? product.images : [{ url: "", position: 0 }];

  let attrs: Record<string, string> = {};
  try { attrs = JSON.parse(variant?.attributes || "{}"); } catch { /* ignore */ }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-secondary mb-8">
        <a href="/" className="hover:text-text transition-colors">Home</a>
        <span>/</span>
        <a href="/shop" className="hover:text-text transition-colors">Shop</a>
        <span>/</span>
        <span className="text-text">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-gradient-to-br from-border/30 to-border/10 rounded-[var(--radius-lg)] overflow-hidden">
            {images[selectedImage]?.url ? (
              <Image
                src={images[selectedImage].url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full relative p-12">
                <Image
                  src={getProductPlaceholder(product.name)}
                  alt={product.name}
                  fill
                  className="object-contain p-12"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-20 h-20 rounded-[var(--radius-sm)] overflow-hidden border-2 shrink-0 transition-colors ${
                    i === selectedImage ? "border-primary" : "border-transparent"
                  }`}
                >
                  {img.url ? (
                    <Image src={img.url} alt="" fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="w-full h-full bg-border/30 relative p-2">
                      <Image
                        src={getProductPlaceholder(product.name)}
                        alt=""
                        fill
                        className="object-contain p-2"
                        sizes="80px"
                      />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          {product.category && (
            <Badge>{product.category.name}</Badge>
          )}

          <h1 className="text-3xl lg:text-4xl font-heading font-bold text-text">{product.name}</h1>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={18} className={i < 4 ? "text-warning fill-warning" : "text-border"} />
              ))}
            </div>
            <span className="text-sm text-text-secondary">(42 reviews)</span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-heading font-bold text-primary">{formatPrice(price)}</span>
            {price < product.base_price && (
              <span className="text-lg text-text-secondary line-through">{formatPrice(product.base_price)}</span>
            )}
          </div>

          <p className="text-text-secondary leading-relaxed">{product.description || "Premium quality product designed for comfort and style. Made with the finest materials and expert craftsmanship."}</p>

          <hr className="border-border" />

          {/* Color / Size Options */}
          {Object.entries(attrs).map(([key, val]) => (
            <div key={key}>
              <p className="text-sm font-medium text-text mb-2 capitalize">{key}</p>
              <div className="flex flex-wrap gap-2">
                {["Default", ...Array(3)].map((_, i) => (
                  <button
                    key={i}
                    className={`px-4 py-2 border rounded-[var(--radius-sm)] text-sm transition-all ${
                      i === 0 ? "border-primary bg-primary/5 text-primary" : "border-border text-text-secondary hover:border-text/30"
                    }`}
                  >
                    {val}{i > 0 ? ` / Option ${i}` : ""}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div>
            <p className="text-sm font-medium text-text mb-2">Quantity</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-border rounded-[var(--radius-sm)]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-border/50 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(99, quantity + 1))}
                  className="p-2 hover:bg-border/50 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              {!inStock && <span className="text-sm text-danger">Out of stock</span>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button size="lg" className="flex-1" disabled={!inStock} onClick={handleAddToCart}>
              <ShoppingCart size={18} className="mr-2" />
              Add to Cart
            </Button>
            <Button variant="secondary" size="lg" className="flex-1" disabled={!inStock} onClick={handleBuyNow}>
              Buy Now
            </Button>
            <button className="p-3 border border-border rounded-[var(--radius-sm)] hover:bg-border/50 transition-colors">
              <Heart size={20} className="text-text-secondary" />
            </button>
          </div>

          {/* Shipping Info */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { icon: Truck, label: "Free Shipping", sub: "On orders $50+" },
              { icon: Shield, label: "Secure", sub: "SSL protected" },
              { icon: RefreshCw, label: "Easy Returns", sub: "30-day policy" },
            ].map((item) => (
              <div key={item.label} className="text-center p-3 bg-border/20 rounded-[var(--radius-sm)]">
                <item.icon size={20} className="mx-auto text-text-secondary mb-1" />
                <p className="text-xs font-medium text-text">{item.label}</p>
                <p className="text-[10px] text-text-secondary">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-16">
        <div className="flex border-b border-border">
          {(["description", "reviews", "specifications"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize transition-colors relative ${
                activeTab === tab ? "text-primary" : "text-text-secondary hover:text-text"
              }`}
            >
              {tab}
              {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
            </button>
          ))}
        </div>
        <div className="py-6">
          {activeTab === "description" && (
            <p className="text-text-secondary leading-relaxed max-w-3xl">
              {product.description || "This premium product combines exceptional quality with elegant design. Crafted from carefully selected materials, it offers durability and comfort for everyday use. Whether you're dressing up for a special occasion or keeping it casual, this versatile piece will become a staple in your collection."}
            </p>
          )}
          {activeTab === "reviews" && (
            <p className="text-text-secondary">Customer reviews coming soon.</p>
          )}
          {activeTab === "specifications" && (
            <div className="grid grid-cols-2 gap-4 max-w-xl">
              {[["Material", "Premium quality"], ["Dimensions", "Standard fit"], ["Care", "Machine washable"], ["Origin", "Imported"]].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-border">
                  <span className="text-text-secondary text-sm">{k}</span>
                  <span className="text-text text-sm font-medium">{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
