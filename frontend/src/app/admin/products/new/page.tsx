"use client";

import { ProductForm } from "@/components/admin/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewProductPage() {
  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text transition-colors mb-2">
          <ArrowLeft size={16} />
          Back to Products
        </Link>
        <h1 className="text-2xl font-heading font-bold text-text">Add Product</h1>
        <p className="text-text-secondary text-sm mt-1">Create a new product listing</p>
      </div>
      <ProductForm />
    </div>
  );
}
