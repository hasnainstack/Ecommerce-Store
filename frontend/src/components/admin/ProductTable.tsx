"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge, Button, Modal } from "@/components/ui";
import { Plus, Eye, Edit, Trash2, Search, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { api } from "@/lib/api";
import { getProductPlaceholder } from "@/lib/placeholders";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ProductTableItem {
  id: number;
  name: string;
  slug: string;
  base_price: number;
  is_active: boolean;
  category?: { id: number; name: string } | null;
  images?: { id: number; url: string; position: number }[];
  variants?: { id: number; stock_qty: number }[];
}

export function ProductTable() {
  const [products, setProducts] = useState<ProductTableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.get<ProductTableItem[]>("/products/")
      .then((data) => setProducts(data))
      .catch(() => {}) // keep empty on error
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteId}`);
      setProducts((prev) => prev.filter((p) => p.id !== deleteId));
    } catch {
      // silent
    }
    setDeleting(false);
    setDeleteId(null);
  };

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
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-text-secondary">
                    <Loader2 size={20} className="mx-auto mb-2 animate-spin" />
                    Loading products...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-text-secondary">
                    {search ? "No products match your search." : "No products yet. Create your first product!"}
                  </td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const imageUrl = product.images?.[0]?.url;
                  const placeholderSrc = getProductPlaceholder(product.name);
                  const stockQty = product.variants?.[0]?.stock_qty ?? 0;
                  const inStock = stockQty > 0;

                  return (
                    <tr key={product.id} className="border-b border-border/50 hover:bg-border/20 transition-colors">
                      <td className="px-5 lg:px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-[var(--radius-sm)] overflow-hidden bg-gradient-to-br from-border/30 to-border/10 shrink-0 relative">
                            {imageUrl ? (
                              <Image
                                src={imageUrl.startsWith("http") ? imageUrl : `${API_BASE}${imageUrl}`}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            ) : (
                              <Image
                                src={placeholderSrc}
                                alt={product.name}
                                fill
                                className="object-cover p-1.5"
                                sizes="40px"
                              />
                            )}
                          </div>
                          <span className="font-medium text-text truncate max-w-[200px]">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-5 lg:px-6 py-3.5 text-text-secondary hidden sm:table-cell">
                        {product.category?.name || "Uncategorized"}
                      </td>
                      <td className="px-5 lg:px-6 py-3.5 font-medium text-text">
                        {formatPrice(product.base_price)}
                      </td>
                      <td className="px-5 lg:px-6 py-3.5 text-text-secondary hidden md:table-cell">
                        <span className={inStock ? "text-text" : "text-danger"}>{stockQty}</span>
                      </td>
                      <td className="px-5 lg:px-6 py-3.5">
                        <Badge variant={product.is_active ? "success" : "danger"}>
                          {product.is_active ? "active" : "inactive"}
                        </Badge>
                      </td>
                      <td className="px-5 lg:px-6 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/shop/${product.slug}`}
                            className="p-1.5 hover:bg-border rounded transition-colors"
                            title="View"
                          >
                            <Eye size={15} className="text-text-secondary" />
                          </Link>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="p-1.5 hover:bg-border rounded transition-colors"
                            title="Edit"
                          >
                            <Edit size={15} className="text-text-secondary" />
                          </Link>
                          <button
                            onClick={() => setDeleteId(product.id)}
                            className="p-1.5 hover:bg-danger/10 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={15} className="text-danger" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
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
          <Button variant="secondary" onClick={() => setDeleteId(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}