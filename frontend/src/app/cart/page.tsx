import { CartView } from "@/components/cart/CartView";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-heading font-bold text-text">Shopping Cart</h1>
          <p className="text-text-secondary mt-1">Manage your items</p>
        </div>
        <Link href="/shop" className="text-sm text-primary hover:text-primary-hover transition-colors hidden sm:block">
          <ArrowLeft size={16} className="inline mr-1" />
          Continue Shopping
        </Link>
      </div>

      <CartView />
    </div>
  );
}
