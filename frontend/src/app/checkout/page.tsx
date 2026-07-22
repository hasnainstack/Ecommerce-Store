"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { ArrowLeft, CreditCard, Lock, CheckCircle, PartyPopper } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const { isAuthenticated, user, accessToken } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    zip: "",
    email: user?.email || "",
  });

  const updateField = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [f]: e.target.value });

  const shipping = getTotal() >= 50 ? 0 : 9.99;
  const tax = getTotal() * 0.08;
  const grandTotal = getTotal() + shipping + tax;

  const handleCheckout = async () => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError("");

    // Try real checkout, fall back to test mode
    try {
      const res = await fetch("http://localhost:8000/checkout/?success_url=http://localhost:3000/cart?success=1&cancel_url=http://localhost:3000/cart?cancelled=1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) throw new Error("Backend unavailable");

      const data = await res.json();
      clearCart();
      window.location.href = data.checkout_url;
    } catch {
      // Test mode — simulate success
      clearCart();
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        {/* Success animation */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <motion.div
            className="absolute inset-0 rounded-full bg-accent/20"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 10, stiffness: 200 }}
          >
            <CheckCircle size={96} className="text-accent relative" />
          </motion.div>
        </div>
        <PartyPopper size={32} className="mx-auto text-warning mb-4" />
        <h1 className="text-3xl font-heading font-bold text-text mb-3">Order Placed!</h1>
        <p className="text-text-secondary mb-2">Thank you for your order{form.firstName ? `, ${form.firstName}` : ""}!</p>
        <p className="text-sm text-text-secondary mb-8">This was a test order — no payment was processed.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/orders"><Button variant="secondary">View Orders</Button></Link>
          <Link href="/shop"><Button>Continue Shopping</Button></Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="relative w-40 h-32 mx-auto mb-6">
          <Image
            src="/images/empty-cart.svg"
            alt="Empty cart"
            fill
            className="object-contain"
            sizes="160px"
          />
        </div>
        <h2 className="text-2xl font-heading font-bold text-text mb-2">Your cart is empty</h2>
        <p className="text-text-secondary mb-6">Add some items before checking out</p>
        <Link href="/shop"><Button>Continue Shopping</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <Link href="/cart" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text transition-colors mb-6">
        <ArrowLeft size={16} />
        Back to Cart
      </Link>
      <h1 className="text-3xl font-heading font-bold text-text mb-8">Checkout</h1>

      {/* Test mode banner */}
      <div className="bg-warning/10 border border-warning/20 rounded-[var(--radius-lg)] p-3 mb-6 text-sm text-text-secondary text-center">
        🧪 Test mode — no payment will be processed
      </div>

      <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
        {/* Shipping Form */}
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
            <h2 className="font-heading font-semibold text-lg text-text mb-5">Shipping Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input id="firstName" label="First Name" value={form.firstName} onChange={updateField("firstName")} required />
              <Input id="lastName" label="Last Name" value={form.lastName} onChange={updateField("lastName")} required />
            </div>
            <div className="mt-4">
              <Input id="address" label="Address" value={form.address} onChange={updateField("address")} required />
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <Input id="city" label="City" value={form.city} onChange={updateField("city")} required />
              <Input id="zip" label="ZIP Code" value={form.zip} onChange={updateField("zip")} required />
            </div>
            <div className="mt-4">
              <Input id="email" label="Email" type="email" value={form.email} onChange={updateField("email")} required />
            </div>
          </div>

          {!isAuthenticated() && (
            <div className="bg-warning/10 border border-warning/20 rounded-[var(--radius-lg)] p-4 text-sm text-text">
              <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link> to proceed with checkout
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6 sticky top-28 space-y-4">
            <h2 className="font-heading font-semibold text-lg text-text">Order Summary</h2>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item.variant_id} className="flex justify-between text-sm">
                  <span className="text-text-secondary truncate mr-2">
                    {item.product_name} x{item.quantity}
                  </span>
                  <span className="text-text font-medium shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <hr className="border-border" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Subtotal</span>
                <span className="text-text font-medium">{formatPrice(getTotal())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Shipping</span>
                <span className="text-text font-medium">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Tax</span>
                <span className="text-text font-medium">{formatPrice(tax)}</span>
              </div>
            </div>

            <hr className="border-border" />

            <div className="flex justify-between">
              <span className="font-heading font-semibold text-text">Total</span>
              <span className="font-heading font-bold text-primary text-lg">{formatPrice(grandTotal)}</span>
            </div>

            {error && <div className="bg-danger/10 text-danger text-sm p-3 rounded-[var(--radius-sm)]">{error}</div>}

            <Button
              size="lg"
              className="w-full"
              onClick={handleCheckout}
              loading={loading}
              disabled={!isAuthenticated()}
            >
              <CreditCard size={18} className="mr-2" />
              {loading ? "Processing..." : "Place Order"}
            </Button>

            <p className="text-xs text-text-secondary text-center flex items-center justify-center gap-1">
              <Lock size={12} />
              Secure checkout powered by Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
