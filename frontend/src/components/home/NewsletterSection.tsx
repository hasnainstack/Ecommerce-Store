"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui";
import { Send, Mail } from "lucide-react";

export function NewsletterSection() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-br from-primary to-primary-hover rounded-[var(--radius-lg)] p-8 lg:p-16 overflow-hidden"
        >
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full" />

          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <Mail size={48} className="mx-auto text-white/80 mb-6" />
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-white mb-4">
              Stay in the Loop
            </h2>
            <p className="text-white/80 mb-8 max-w-md mx-auto">
              Subscribe to our newsletter for exclusive deals, new arrivals, and style inspiration.
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-12 px-5 bg-white/10 border border-white/20 rounded-[var(--radius-sm)] text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
              />
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 shrink-0">
                Subscribe
                <Send size={16} className="ml-2" />
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
