"use client";

import { motion } from "framer-motion";
import { DecorativeBackground } from "@/components/ui/DecorativeBackground";
import { Smartphone, Shirt, Footprints, Eye, Dumbbell, Armchair } from "lucide-react";
import Image from "next/image";

const categories = [
  { name: "Electronics", icon: Smartphone, count: "1,234 items", color: "from-blue-500/20 to-blue-600/10", img: "/images/products/watch.svg" },
  { name: "Fashion", icon: Shirt, count: "856 items", color: "from-pink-500/20 to-pink-600/10", img: "/images/products/tshirt.svg" },
  { name: "Shoes", icon: Footprints, count: "567 items", color: "from-amber-500/20 to-amber-600/10", img: "/images/products/shoes.svg" },
  { name: "Beauty", icon: Eye, count: "432 items", color: "from-rose-500/20 to-rose-600/10", img: "/images/products/beauty.svg" },
  { name: "Sports", icon: Dumbbell, count: "321 items", color: "from-green-500/20 to-green-600/10", img: "/images/products/sports.svg" },
  { name: "Furniture", icon: Armchair, count: "198 items", color: "from-purple-500/20 to-purple-600/10", img: "/images/products/furniture.svg" },
];

export function CategoriesSection() {
  return (
    <section className="relative overflow-hidden py-16 lg:py-24">
      <DecorativeBackground variant="section" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-text">
            Shop by Category
          </h2>
          <p className="text-text-secondary mt-3 max-w-md mx-auto">
            Browse through our curated categories and find exactly what you need
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -8 }}
              className="group bg-card border border-border rounded-[var(--radius-lg)] p-6 text-center transition-all duration-300 hover:shadow-hover overflow-hidden relative"
            >
              {/* Hover image reveal */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <Image
                  src={cat.img}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 16vw"
                />
                <div className="absolute inset-0 bg-card/80 backdrop-blur-[2px]" />
              </div>
              <div className="relative z-10">
                <div className={`w-16 h-16 mx-auto bg-gradient-to-br ${cat.color} rounded-[var(--radius-sm)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <cat.icon size={28} className="text-text" />
                </div>
                <h3 className="font-heading font-semibold text-text">{cat.name}</h3>
                <p className="text-xs text-text-secondary mt-1">{cat.count}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
