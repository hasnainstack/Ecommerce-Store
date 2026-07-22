"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, Button, Modal } from "@/components/ui";
import { Plus, Eye, Edit, Trash2, Search } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const products = [
  { id: 1, name: "Wireless Headphones Pro", category: "Electronics", price: 149.99, stock: 25, status: "active" as const, image: "" },
  { id: 2, name: "Premium Cotton T-Shirt", category: "Fashion", price: 39.99, stock: 100, status: "active" as const, image: "" },
  { id: 3, name: "Running Shoes Ultra", category: "Shoes", price: 129.99, stock: 50, status: "active" as const, image: "" },
  { id: 4, name: "Smart Watch Series 5", category: "Electronics", price: 299.99, stock: 15, status: "active" as const, image: "" },
  { id: 5, name: "Denim Jacket Classic", category: "Fashion", price: 89.99, stock: 0, status: "inactive" as const, image: "" },
  { id: 6, name: "Yoga Mat Premium", category: "Sports", price: 49.99, stock: 75, status: "active" as const, image: "" },
];

export function ProductTable() {
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-card border border-border rounded-[var(--radius-sm)] text-text placeholder:text-text-secondary/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <Link href="/admin/products/new">
          <Button size="sm">
            <Plus size={16} className="mr-1.5" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-[var(--radius-lg)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-text-secondary">
                <th className="text-left font-medium px-5 lg:px-6 py-3.5">Product</th>
                <th className="text-left font-medium px-5 lg:px-6 py-3.5 hidden sm:table-cell">Category</th>
                <th className="text-left font-medium px-5 lg:px-6 py-3.5">Price</th>
                <th className="text-left font-medium px-5 lg:px-6 py-3.5 hidden md:table-cell">Stock</th>
                <th className="text-left font-medium px-5 lg:px-6 py-3.5">Status</th>
                <th className="text-right font-medium px-5 lg:px-6 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b border-border/50 hover:bg-border/20 transition-colors">
                  <td className="px-5 lg:px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-border/30 to-border/10 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0">
                        <span className="text-lg">📦</span>
                      </div>
                      <span className="font-medium text-text">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-5 lg:px-6 py-3.5 text-text-secondary hidden sm:table-cell">{product.category}</td>
                  <td className="px-5 lg:px-6 py-3.5 font-medium text-text">{formatPrice(product.price)}</td>
                  <td className="px-5 lg:px-6 py-3.5 text-text-secondary hidden md:table-cell">{product.stock}</td>
                  <td className="px-5 lg:px-6 py-3.5">
                    <Badge variant={product.status === "active" ? "success" : "danger"}>{product.status}</Badge>
                  </td>
                  <td className="px-5 lg:px-6 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 hover:bg-border rounded transition-colors" title="View">
                        <Eye size={15} className="text-text-secondary" />
                      </button>
                      <Link href={`/admin/products/${product.id}/edit`} className="p-1.5 hover:bg-border rounded transition-colors" title="Edit">
                        <Edit size={15} className="text-text-secondary" />
                      </Link>
                      <button
                        onClick={() => setDeleteId(product.id)}
                        className="p-1.5 hover:bg-danger/10 rounded transition-colors" title="Delete"
                      >
                        <Trash2 size={15} className="text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteId !== null} onClose={() => setDeleteId(null)} title="Delete Product?">
        <p className="text-text-secondary mb-6">
          This action cannot be undone. The product will be soft-deleted and hidden from the storefront.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => { setDeleteId(null); }}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
