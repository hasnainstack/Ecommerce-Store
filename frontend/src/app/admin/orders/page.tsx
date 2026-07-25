"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatPrice } from "@/lib/utils";
import { api } from "@/lib/api";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from "@/types/order";
import type { AdminOrderRead, AdminOrderListResponse, OrderStatus } from "@/types/order";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

const PAGE_SIZE = 20;

export default function OrdersPage() {
  const router = useRouter();

  const [data, setData] = useState<AdminOrderRead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [skip, setSkip] = useState(0);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setSkip(0);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("skip", String(skip));
      params.set("limit", String(PAGE_SIZE));
      if (statusFilter) params.set("status", statusFilter);
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await api.get<AdminOrderListResponse>(
        `/orders/admin/all?${params.toString()}`
      );
      setData(res.data);
      setTotal(res.total);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load orders";
      setError(msg);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [skip, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(skip / PAGE_SIZE) + 1;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-text">Orders</h1>
        <p className="text-text-secondary text-sm mt-1">Manage customer orders</p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search by customer email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-white border border-border rounded-[var(--radius-sm)] text-sm text-text placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>
        <div className="relative w-full sm:w-48">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setSkip(0); }}
            className="w-full h-11 pl-10 pr-4 bg-white border border-border rounded-[var(--radius-sm)] text-sm text-text appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-[var(--radius-lg)] overflow-hidden">
        {error && (
          <div className="p-4 text-sm text-danger bg-danger/5 border-b border-border">
            {error}
            <button onClick={fetchOrders} className="ml-2 underline hover:no-underline">Retry</button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-text-secondary">
                <th className="text-left font-medium px-5 lg:px-6 py-3.5">Order #</th>
                <th className="text-left font-medium px-5 lg:px-6 py-3.5">Customer</th>
                <th className="text-left font-medium px-5 lg:px-6 py-3.5 hidden sm:table-cell">Items</th>
                <th className="text-left font-medium px-5 lg:px-6 py-3.5">Total</th>
                <th className="text-left font-medium px-5 lg:px-6 py-3.5">Status</th>
                <th className="text-left font-medium px-5 lg:px-6 py-3.5 hidden md:table-cell">Date</th>
                <th className="text-right font-medium px-5 lg:px-6 py-3.5">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="px-5 lg:px-6 py-3.5"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-5 lg:px-6 py-3.5"><Skeleton className="h-4 w-36" /></td>
                      <td className="px-5 lg:px-6 py-3.5 hidden sm:table-cell"><Skeleton className="h-4 w-8" /></td>
                      <td className="px-5 lg:px-6 py-3.5"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-5 lg:px-6 py-3.5"><Skeleton className="h-5 w-20 rounded-full" /></td>
                      <td className="px-5 lg:px-6 py-3.5 hidden md:table-cell"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-5 lg:px-6 py-3.5"><Skeleton className="h-8 w-16 ml-auto rounded-[var(--radius-sm)]" /></td>
                    </tr>
                  ))
                : data.length === 0
                  ? (
                    <tr>
                      <td colSpan={7} className="px-5 lg:px-6 py-12 text-center text-text-secondary">
                        {debouncedSearch || statusFilter
                          ? "No orders match your filters."
                          : "No orders yet."}
                      </td>
                    </tr>
                  )
                  : data.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-border/50 hover:bg-border/20 transition-colors cursor-pointer"
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                      >
                        <td className="px-5 lg:px-6 py-3.5 font-medium text-text">
                          #{order.id}
                        </td>
                        <td className="px-5 lg:px-6 py-3.5">
                          <div>
                            <p className="text-text capitalize">{order.customer_name}</p>
                            <p className="text-xs text-text-secondary">{order.customer_email}</p>
                          </div>
                        </td>
                        <td className="px-5 lg:px-6 py-3.5 text-text-secondary hidden sm:table-cell">
                          {order.items.length}
                        </td>
                        <td className="px-5 lg:px-6 py-3.5 font-medium text-text">
                          {formatPrice(order.total_amount)}
                        </td>
                        <td className="px-5 lg:px-6 py-3.5">
                          <Badge variant={ORDER_STATUS_COLORS[order.status] ?? "default"}>
                            {ORDER_STATUS_LABELS[order.status] ?? order.status}
                          </Badge>
                        </td>
                        <td className="px-5 lg:px-6 py-3.5 text-text-secondary hidden md:table-cell">
                          {new Date(order.created_at).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </td>
                        <td className="px-5 lg:px-6 py-3.5 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/admin/orders/${order.id}`);
                            }}
                          >
                            <Eye size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > PAGE_SIZE && !loading && (
          <div className="flex items-center justify-between px-5 lg:px-6 py-3.5 border-t border-border">
            <p className="text-sm text-text-secondary">
              Showing {skip + 1}–{Math.min(skip + PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={skip === 0}
                onClick={() => setSkip((s) => Math.max(0, s - PAGE_SIZE))}
              >
                <ChevronLeft size={16} />
                Previous
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={skip + PAGE_SIZE >= total}
                onClick={() => setSkip((s) => s + PAGE_SIZE)}
              >
                Next
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
