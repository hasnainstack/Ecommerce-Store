"use client";

import { motion } from "framer-motion";
import { Truck, Shield, HeadphonesIcon, RefreshCw } from "lucide-react";

const benefits = [
  { icon: Truck, title: "Free Shipping", desc: "Free shipping on all orders over $50" },
  { icon: Shield, title: "Secure Payment", desc: "100% secure checkout with encryption" },
  { icon: HeadphonesIcon, title: "24/7 Support", desc: "Round-the-clock customer support" },
  { icon: RefreshCw, title: "Easy Returns", desc: "30-day hassle-free return policy" },
];

export function BenefitsSection() {
  return (
    <section className="relative overflow-hidden py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-6"
            >
              <div className="w-14 h-14 mx-auto bg-primary/5 rounded-full flex items-center justify-center mb-4">
                <benefit.icon size={26} className="text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-text mb-1.5">{benefit.title}</h3>
              <p className="text-text-secondary text-sm">{benefit.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
