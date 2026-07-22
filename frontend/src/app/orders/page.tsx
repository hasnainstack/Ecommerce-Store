"use client";

import Image from "next/image";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function OrdersPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  if (!isAuthenticated()) {
    router.push("/login");
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text transition-colors mb-6">
        <ArrowLeft size={16} />
        Back to Profile
      </Link>
      <h1 className="text-3xl font-heading font-bold text-text mb-8">My Orders</h1>

      <div className="bg-card border border-border rounded-[var(--radius-lg)] p-12 text-center">
        <div className="relative w-40 h-32 mx-auto mb-6">
          <Image
            src="/images/empty-orders.svg"
            alt="No orders"
            fill
            className="object-contain"
            sizes="160px"
          />
        </div>
        <h2 className="text-xl font-heading font-semibold text-text mb-2">No orders yet</h2>
        <p className="text-text-secondary mb-6">Looks like you haven&apos;t placed any orders yet.</p>
        <Link href="/shop">
          <span className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-[var(--radius-sm)] font-medium text-sm hover:bg-primary/90 transition-colors">
            Start Shopping
          </span>
        </Link>
      </div>
    </div>
  );
}
