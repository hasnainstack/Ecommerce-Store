"use client";

import { ProductTable } from "@/components/admin/ProductTable";

export default function ProductsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-text">Products</h1>
        <p className="text-text-secondary text-sm mt-1">Manage your product catalog</p>
      </div>
      <ProductTable />
    </div>
  );
}
