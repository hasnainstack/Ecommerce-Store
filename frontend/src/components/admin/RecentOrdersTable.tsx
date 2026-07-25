"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button } from "@/components/ui";
import { Eye } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { api } from "@/lib/api";
import { useUIStore } from "@/stores/ui";

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface AdminOrderRead {
  id: number;
  status: string;
  total_amount: number;
  customer_email: string;
  customer_name: string;
  created_at: string;
  items: OrderItem[];
}

interface AdminOrderListResponse {
  data: AdminOrderRead[];
  total: number;
}

const statusColors: Record<string, "warning" | "info" | "default" | "success" | "danger"> = {
  pending: "warning",
  confirmed: "info",
  processing: "info",
  shipped: "default",
  delivered: "success",
  cancelled: "danger",
  refunded: "danger",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export function RecentOrdersTable() {
  const { showToast } = useUIStore();
  const [orders, setOrders] = useState<AdminOrderRead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<AdminOrderListResponse>("/orders/admin/all?limit=5")
      .then((res) => setOrders(res.data || []))
      .catch(() => showToast("Failed to load recent orders", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} hr ago`;
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return d.toLocaleDateString();
  };

  const totalItems = (order: AdminOrderRead) =>
    order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  return (
    <div className="bg-card border border-border rounded-[var(--radius-lg)] overflow-hidden">
      <div className="flex items-center justify-between p-5 lg:p-6 border-b border-border">
        <h3 className="font-heading font-semibold text-text">Recent Orders</h3>
        <Link href="/admin/orders">
          <Button variant="ghost" size="sm">View All</Button>
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-text-secondary">
              <th className="text-left font-medium px-5 lg:px-6 py-3">Order</th>
              <th className="text-left font-medium px-5 lg:px-6 py-3">Customer</th>
              <th className="text-left font-medium px-5 lg:px-6 py-3 hidden sm:table-cell">Items</th>
              <th className="text-left font-medium px-5 lg:px-6 py-3">Total</th>
              <th className="text-left font-medium px-5 lg:px-6 py-3">Status</th>
              <th className="text-right font-medium px-5 lg:px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 lg:px-6 py-8 text-center text-text-secondary text-sm">
                  Loading...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 lg:px-6 py-8 text-center text-text-secondary text-sm">
                  No orders yet
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-border/50 hover:bg-border/20 transition-colors">
                  <td className="px-5 lg:px-6 py-3.5 font-medium text-text">#{order.id}</td>
                  <td className="px-5 lg:px-6 py-3.5 text-text-secondary">{order.customer_name || order.customer_email}</td>
                  <td className="px-5 lg:px-6 py-3.5 text-text-secondary hidden sm:table-cell">{totalItems(order)}</td>
                  <td className="px-5 lg:px-6 py-3.5 font-medium text-text">{formatPrice(order.total_amount)}</td>
                  <td className="px-5 lg:px-6 py-3.5">
                    <Badge variant={statusColors[order.status] || "default"}>
                      {statusLabels[order.status] || order.status}
                    </Badge>
                  </td>
                  <td className="px-5 lg:px-6 py-3.5 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex p-1.5 hover:bg-border rounded transition-colors"
                    >
                      <Eye size={16} className="text-text-secondary" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
