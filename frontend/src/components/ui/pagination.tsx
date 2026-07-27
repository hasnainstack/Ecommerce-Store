"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { BRAND } from "@/lib/brand";

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      <button
        aria-label="Previous page"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 disabled:opacity-30"
      >
        <ChevronLeft size={16} />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          onClick={() => onPageChange(n)}
          style={n === page ? { backgroundColor: BRAND.colors.primary } : undefined}
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition ${
            n === page ? "text-white" : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          {n}
        </button>
      ))}

      <button
        aria-label="Next page"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 disabled:opacity-30"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}