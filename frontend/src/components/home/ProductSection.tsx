"use client";

import { motion } from "framer-motion";
import { DecorativeBackground } from "@/components/ui/DecorativeBackground";
import { ProductCard } from "@/components/product/ProductCard";

const FEATURED_PRODUCTS = [
  {
    id: 1,
    name: "Wireless Headphones Pro",
    slug: "wireless-headphones-pro",
    description: "",
    base_price: 149.99,
    category_id: 1,
    is_active: true,
    images: [],
    variants: [{ id: 1, price_override: null, stock_qty: 25, attributes: '{"color": "Black"}' }],
  },
  {
    id: 2,
    name: "Premium Cotton T-Shirt",
    slug: "premium-cotton-tshirt",
    description: "",
    base_price: 39.99,
    category_id: 2,
    is_active: true,
    images: [],
    variants: [{ id: 2, price_override: null, stock_qty: 100, attributes: '{"size": "M", "color": "White"}' }],
  },
  {
    id: 3,
    name: "Running Shoes Ultra",
    slug: "running-shoes-ultra",
    description: "",
    base_price: 129.99,
    category_id: 3,
    is_active: true,
    images: [],
    variants: [{ id: 3, price_override: null, stock_qty: 50, attributes: '{"size": "US 10"}' }],
  },
  {
    id: 4,
    name: "Smart Watch Series 5",
    slug: "smart-watch-series-5",
    description: "",
    base_price: 299.99,
    category_id: 1,
    is_active: true,
    images: [],
    variants: [{ id: 4, price_override: null, stock_qty: 15, attributes: '{"color": "Silver"}' }],
  },
];

interface ProductSectionProps {
  title: string;
  subtitle: string;
  products?: typeof FEATURED_PRODUCTS;
}

export function ProductSection({ title, subtitle, products = FEATURED_PRODUCTS }: ProductSectionProps) {
  return (
    <section className="relative overflow-hidden py-16 lg:py-24 bg-white">
      <DecorativeBackground variant="subtle" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4"
        >
          <div>
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-text">{title}</h2>
            <p className="text-text-secondary mt-2">{subtitle}</p>
          </div>
          <a
            href="/shop"
            className="text-primary hover:text-primary-hover font-medium text-sm transition-colors whitespace-nowrap"
          >
            View All &rarr;
          </a>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
