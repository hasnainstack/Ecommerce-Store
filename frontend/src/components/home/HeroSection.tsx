"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui";
import { DecorativeBackground } from "@/components/ui/DecorativeBackground";
import { ArrowRight, Shield, CreditCard, HeadphonesIcon, Zap, Sparkles } from "lucide-react";
import Image from "next/image";

const floatingItems = [
  { icon: Zap, label: "Fast Delivery", sub: "2-3 business days", color: "from-blue-500/20 to-blue-600/10" },
  { icon: Shield, label: "Secure", sub: "Protected checkout", color: "from-green-500/20 to-green-600/10" },
  { icon: HeadphonesIcon, label: "Support", sub: "24/7 assistance", color: "from-purple-500/20 to-purple-600/10" },
  { icon: CreditCard, label: "10% OFF", sub: "First purchase", color: "from-amber-500/20 to-amber-600/10" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-white to-accent/5">
      <DecorativeBackground variant="hero" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Text */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full border border-primary/20"
              >
                <Sparkles size={14} />
                Summer Collection 2026
                <Sparkles size={14} />
              </motion.span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-text leading-tight">
                Elevate Your
                <span className="text-primary relative">
                  {" "}Style
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/20" viewBox="0 0 200 12" preserveAspectRatio="none">
                    <path d="M0 8Q50 0 100 8T200 8" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round"/>
                  </svg>
                </span>
                <br />
                This Summer
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-text-secondary max-w-lg leading-relaxed"
              >
                Discover the latest trends with up to 50% off on premium collections.
                Shop now and redefine your wardrobe.
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Button size="lg" className="shadow-lg shadow-primary/25 group">
                Shop Now
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="secondary" size="lg">
                Explore More
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center gap-8 text-sm text-text-secondary"
            >
              <div className="flex -space-x-2">
                {[
                  { initial: "J", color: "bg-blue-500" },
                  { initial: "S", color: "bg-emerald-500" },
                  { initial: "M", color: "bg-amber-500" },
                  { initial: "K", color: "bg-purple-500" },
                ].map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + i * 0.08 }}
                    className={`w-8 h-8 rounded-full border-2 border-card ${a.color} flex items-center justify-center text-white text-[10px] font-bold`}
                  >
                    {a.initial}
                  </motion.div>
                ))}
              </div>
              <span>Join <strong className="text-text">12k+</strong> happy customers</span>

              {/* Pulse dot */}
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                </span>
                Live
              </span>
            </motion.div>
          </div>

          {/* Right — Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] max-w-lg mx-auto">
              {/* Main card with hero banner */}
              <div className="w-full h-full bg-card border border-border rounded-[var(--radius-lg)] shadow-card overflow-hidden relative">
                <Image
                  src="/images/hero-banner.png"
                  alt="Summer Collection"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                {/* Text overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <h3 className="font-heading font-bold text-2xl text-white">Summer Collection</h3>
                    <p className="text-primary font-bold text-xl mt-2">Up to 50% OFF</p>
                  </motion.div>
                </div>
                {/* Corner accent decoration */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/30 to-transparent rounded-bl-full" />
              </div>

              {/* Floating info cards */}
              {floatingItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 + i * 0.12 }}
                  whileHover={{ scale: 1.05 }}
                  className={`absolute bg-card border border-border rounded-[var(--radius-sm)] shadow-card p-2.5 flex items-center gap-2.5 ${
                    i === 0 ? "-top-3 left-6" : i === 1 ? "top-1/4 -right-3" : i === 2 ? "-bottom-3 left-8" : "bottom-1/4 -left-3"
                  }`}
                >
                  <div className={`w-9 h-9 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center`}>
                    <item.icon size={18} className="text-text" />
                  </div>
                  <div className="pr-1">
                    <p className="text-xs font-semibold text-text">{item.label}</p>
                    <p className="text-[10px] text-text-secondary">{item.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
