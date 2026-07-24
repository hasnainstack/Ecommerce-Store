"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function ProductPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.get<any>(`/products/slug/${slug}`)
      .then(setProduct)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-text-secondary">
        <Loader2 size={24} className="animate-spin mr-2" />
        Loading product...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-2xl font-heading font-bold text-text mb-2">Product not found</h2>
        <p className="text-text-secondary">The product you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return <ProductDetail product={product} />;
}
