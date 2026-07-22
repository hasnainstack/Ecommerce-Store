"use client";

import Link from "next/link";
import { Heart, ShoppingCart, User } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-heading font-bold text-sm">S</span>
              </div>
              <span className="font-heading font-bold text-xl text-text">Store</span>
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
              Your premium online shopping destination. Quality products, fast delivery, and exceptional customer service.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-text mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {["Home", "Shop", "Categories", "About Us", "Contact"].map((link) => (
                <li key={link}>
                  <Link
                    href={link === "Home" ? "/" : `/shop`}
                    className="text-text-secondary hover:text-text transition-colors text-sm"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-heading font-semibold text-text mb-4">Customer Service</h4>
            <ul className="space-y-2.5">
              {["Help & FAQs", "Shipping Info", "Returns", "Size Guide", "Privacy Policy"].map((link) => (
                <li key={link}>
                  <Link href="#" className="text-text-secondary hover:text-text transition-colors text-sm">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-text mb-4">Contact Us</h4>
            <ul className="space-y-2.5 text-text-secondary text-sm">
              <li>support@store.com</li>
              <li>+1 (555) 123-4567</li>
              <li>123 Commerce St, Suite 100<br />San Francisco, CA 94102</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-secondary text-sm">
            &copy; {currentYear} Store. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-text-secondary hover:text-text transition-colors">
              <Heart size={18} />
            </Link>
            <Link href="/cart" className="text-text-secondary hover:text-text transition-colors">
              <ShoppingCart size={18} />
            </Link>
            <Link href="/login" className="text-text-secondary hover:text-text transition-colors">
              <User size={18} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
