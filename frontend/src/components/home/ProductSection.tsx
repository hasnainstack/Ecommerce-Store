"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DecorativeBackground } from "@/components/ui/DecorativeBackground";
import { ProductCard } from "@/components/product/ProductCard";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface ProductSectionProps {
  title: string;
  subtitle: string;
}

export function ProductSection({ title, subtitle }: ProductSectionProps) {
  const [products, setProducts] = useState<Array<Record<string, any>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Array<Record<string, any>>>("/products/")
      .then((data) => setProducts(data.slice(0, 4)))
      .catch(() => {
        // Keep empty on error — the ProductCard will show placeholders
      })
      .finally(() => setLoading(false));
  }, []);

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

        {loading ? (
          <div className="flex items-center justify-center py-12 text-text-secondary">
            <Loader2 size={24} className="animate-spin mr-2" />
            Loading products...
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <ProductCard product={product as any} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}