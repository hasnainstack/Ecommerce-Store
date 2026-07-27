"use client";

import { useState } from "react";
import FilterBar, { ProductFilters } from "./FilterBar";
import ProductCard, { ProductCardData } from "./ProductCard";
import Pagination from "../ui/pagination";

const PAGE_SIZE = 12;

export default function ProductGrid({ products }: { products: ProductCardData[] }) {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ProductFilters | null>(null);

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const visible = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <FilterBar onChange={setFilters} />

      <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
}