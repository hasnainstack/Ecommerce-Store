"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ProductGrid } from "@/components/product/ProductGrid";
import { DecorativeBackground } from "@/components/ui/DecorativeBackground";
import { Button } from "@/components/ui";
import { Search, SlidersHorizontal, X, Sparkles } from "lucide-react";
import Image from "next/image";

const SAMPLE_PRODUCTS = [
  { id: 1, name: "Wireless Headphones Pro", slug: "wireless-headphones-pro", base_price: 149.99, category_id: 1, is_active: true, images: [], variants: [{ id: 1, price_override: null, stock_qty: 25 }] },
  { id: 2, name: "Premium Cotton T-Shirt", slug: "premium-cotton-tshirt", base_price: 39.99, category_id: 2, is_active: true, images: [], variants: [{ id: 2, price_override: null, stock_qty: 100 }] },
  { id: 3, name: "Running Shoes Ultra", slug: "running-shoes-ultra", base_price: 129.99, category_id: 3, is_active: true, images: [], variants: [{ id: 3, price_override: null, stock_qty: 50 }] },
  { id: 4, name: "Smart Watch Series 5", slug: "smart-watch-series-5", base_price: 299.99, category_id: 1, is_active: true, images: [], variants: [{ id: 4, price_override: null, stock_qty: 15 }] },
  { id: 5, name: "Denim Jacket Classic", slug: "denim-jacket-classic", base_price: 89.99, category_id: 2, is_active: true, images: [], variants: [{ id: 5, price_override: null, stock_qty: 0 }] },
  { id: 6, name: "Yoga Mat Premium", slug: "yoga-mat-premium", base_price: 49.99, category_id: 5, is_active: true, images: [], variants: [{ id: 6, price_override: null, stock_qty: 75 }] },
  { id: 7, name: "Leather Wallet", slug: "leather-wallet", base_price: 59.99, category_id: 2, is_active: true, images: [], variants: [{ id: 7, price_override: null, stock_qty: 40 }] },
  { id: 8, name: "Bluetooth Speaker", slug: "bluetooth-speaker", base_price: 79.99, category_id: 1, is_active: true, images: [], variants: [{ id: 8, price_override: null, stock_qty: 30 }] },
];

const categories = ["All", "Electronics", "Fashion", "Shoes", "Beauty", "Sports", "Furniture"];

export default function ShopPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = SAMPLE_PRODUCTS.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || (activeCategory === "Electronics" && p.category_id === 1) || (activeCategory === "Fashion" && p.category_id === 2) || (activeCategory === "Shoes" && p.category_id === 3) || (activeCategory === "Sports" && p.category_id === 5);
    const matchesPrice = p.base_price >= priceRange[0] && p.base_price <= priceRange[1];
    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="relative overflow-hidden">
      <DecorativeBackground variant="subtle" />

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <nav className="flex items-center gap-2 text-sm text-text-secondary mb-3">
              <a href="/" className="hover:text-text transition-colors">Home</a>
              <span>/</span>
              <span className="text-text">Shop</span>
            </nav>
            <h1 className="text-3xl lg:text-4xl font-heading font-bold text-text flex items-center gap-3">
              Shop All
              <Sparkles size={24} className="text-primary" />
            </h1>
            <p className="text-text-secondary mt-1">{filtered.length} products available</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-6"
        >
          {categories.map((cat, i) => (
            <motion.button
              key={cat}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: 0.1 + i * 0.05 }}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-primary text-white shadow-md shadow-primary/25"
                  : "bg-card border border-border text-text-secondary hover:bg-border/50 hover:text-text"
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </motion.div>

        {/* Search + Filter Toggle */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-card border border-border rounded-[var(--radius-sm)] text-text placeholder:text-text-secondary/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 border rounded-[var(--radius-sm)] transition-colors ${
              showFilters ? "border-primary bg-primary/5 text-primary" : "border-border text-text-secondary hover:bg-border/50"
            }`}
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {/* Price Filter Drawer */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-[var(--radius-lg)] p-5 mb-6"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-text text-sm">Price Range</span>
              <button onClick={() => setShowFilters(false)} className="p-0.5 hover:bg-border rounded">
                <X size={16} />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0}
                max={500}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="flex-1 accent-primary"
              />
              <span className="text-sm text-text-secondary min-w-[60px]">${priceRange[0]} — ${priceRange[1]}</span>
            </div>
          </motion.div>
        )}

        {/* Products */}
        {filtered.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <ProductGrid products={filtered} />
          </motion.div>
        ) : (
          <div className="text-center py-24">
            <div className="relative w-40 h-32 mx-auto mb-6">
              <Image
                src="/images/empty-cart.svg"
                alt="No results"
                fill
                className="object-contain"
                sizes="160px"
              />
            </div>
            <p className="text-text-secondary text-lg mb-2">No products found</p>
            <p className="text-text-secondary text-sm mb-6">Try adjusting your search or filter criteria</p>
            <Button variant="ghost" onClick={() => { setSearch(""); setActiveCategory("All"); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
