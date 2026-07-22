"use client";

import { motion } from "framer-motion";
import { DecorativeBackground } from "@/components/ui/DecorativeBackground";
import { Star, Quote, Sparkles } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Verified Buyer",
    content: "Absolutely love my purchase! The quality exceeded my expectations and delivery was incredibly fast. Will definitely be shopping here again.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Verified Buyer",
    content: "Best online shopping experience I've had. The customer service team went above and beyond to help me with my order. Highly recommended!",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Verified Buyer",
    content: "The product descriptions are accurate and the sizing guide is spot-on. I've ordered multiple items and each one has been perfect.",
    rating: 4,
  },
];

export function TestimonialsSection() {
  return (
    <section className="relative overflow-hidden py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-white to-accent/5">
      <DecorativeBackground variant="section" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-text flex items-center justify-center gap-2">
            What Our Customers Say
            <Sparkles size={24} className="text-warning" />
          </h2>
          <p className="text-text-secondary mt-3 max-w-md mx-auto">
            Real reviews from real customers
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              whileHover={{ y: -5 }}
              className="bg-card border border-border rounded-[var(--radius-lg)] p-8 relative hover:shadow-hover transition-all duration-300"
            >
              <Quote size={32} className="text-primary/10 absolute top-6 right-6" />
              {/* Rating */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <motion.div
                    key={j}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 + j * 0.05 }}
                  >
                    <Star
                      size={16}
                      className={j < t.rating ? "text-warning fill-warning" : "text-border"}
                    />
                  </motion.div>
                ))}
              </div>
              <p className="text-text-secondary text-sm leading-relaxed mb-6">&ldquo;{t.content}&rdquo;</p>
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center font-heading font-semibold text-sm text-text"
                >
                  {t.name.split(" ").map(n => n[0]).join("")}
                </motion.div>
                <div>
                  <p className="font-medium text-sm text-text">{t.name}</p>
                  <p className="text-xs text-text-secondary">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
