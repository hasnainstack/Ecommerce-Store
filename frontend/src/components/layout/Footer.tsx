"use client";

import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: "Facebook", path: "/images/icons/social/facebook.svg" },
    { name: "Twitter", path: "/images/icons/social/twitter.svg" },
    { name: "Instagram", path: "/images/icons/social/instagram.svg" },
    { name: "YouTube", path: "/images/icons/social/youtube.svg" },
    { name: "Pinterest", path: "/images/icons/social/pinterest.svg" },
  ];

  const paymentIcons = [
    { name: "Visa", path: "/images/icons/payment/visa.svg" },
    { name: "Mastercard", path: "/images/icons/payment/mastercard.svg" },
    { name: "Amex", path: "/images/icons/payment/amex.svg" },
    { name: "PayPal", path: "/images/icons/payment/paypal.svg" },
    { name: "Discover", path: "/images/icons/payment/discover.svg" },
  ];

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
            <p className="text-text-secondary text-sm leading-relaxed max-w-xs mb-4">
              Your premium online shopping destination. Quality products, fast delivery, and exceptional customer service.
            </p>
            {/* Social Media Icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href="#"
                  className="w-8 h-8 bg-border/50 hover:bg-primary/10 rounded-lg flex items-center justify-center transition-colors group"
                  aria-label={social.name}
                >
                  <img
                    src={social.path}
                    alt={social.name}
                    width="16"
                    height="16"
                    className="opacity-60 group-hover:opacity-100 transition-opacity"
                  />
                </Link>
              ))}
            </div>
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
          {/* Payment Icons */}
          <div className="flex items-center gap-2">
            {paymentIcons.map((payment) => (
              <div
                key={payment.name}
                className="h-7 bg-white rounded border border-border/50 px-1.5 flex items-center justify-center"
                title={payment.name}
              >
                <img
                  src={payment.path}
                  alt={payment.name}
                  className="max-h-5 w-auto"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
