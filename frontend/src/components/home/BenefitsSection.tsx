"use client";

import { motion } from "framer-motion";
import { DecorativeBackground } from "@/components/ui/DecorativeBackground";
import { Truck, Shield, HeadphonesIcon, RefreshCw, ArrowRight } from "lucide-react";

const benefits = [
  { icon: Truck, title: "Free Shipping", desc: "Free shipping on all orders over $50", gradient: "from-blue-500 to-blue-600" },
  { icon: Shield, title: "Secure Payment", desc: "100% secure checkout with encryption", gradient: "from-green-500 to-green-600" },
  { icon: HeadphonesIcon, title: "24/7 Support", desc: "Round-the-clock customer support", gradient: "from-purple-500 to-purple-600" },
  { icon: RefreshCw, title: "Easy Returns", desc: "30-day hassle-free return policy", gradient: "from-amber-500 to-amber-600" },
];

export function BenefitsSection() {
  return (
    <section className="relative overflow-hidden py-16 lg:py-24 bg-white">
      <DecorativeBackground variant="section" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-text">Why Shop With Us</h2>
          <p className="text-text-secondary mt-3 max-w-md mx-auto">
            We provide the best shopping experience for our customers
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="bg-card border border-border rounded-[var(--radius-lg)] p-6 lg:p-8 text-center group hover:shadow-hover transition-all duration-300 relative overflow-hidden"
            >
              {/* Hover gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

              <div className="relative">
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, -5, 0] }}
                  transition={{ duration: 0.5 }}
                  className={`w-14 h-14 mx-auto bg-gradient-to-br ${benefit.gradient}/10 rounded-[var(--radius-sm)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <benefit.icon size={28} className="text-primary" />
                </motion.div>
                <h3 className="font-heading font-semibold text-text mb-1.5">{benefit.title}</h3>
                <p className="text-text-secondary text-sm">{benefit.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
