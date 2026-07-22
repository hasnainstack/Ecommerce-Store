"use client";

import { Badge, Button } from "@/components/ui";
import { Eye } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const recentOrders = [
  { id: "#ORD-001", customer: "Sarah Johnson", items: 3, total: 249.99, status: "paid" as const, date: "2 min ago" },
  { id: "#ORD-002", customer: "Michael Chen", items: 1, total: 89.99, status: "paid" as const, date: "15 min ago" },
  { id: "#ORD-003", customer: "Emily Rodriguez", items: 2, total: 159.98, status: "shipped" as const, date: "1 hour ago" },
  { id: "#ORD-004", customer: "David Kim", items: 5, total: 429.95, status: "pending" as const, date: "3 hours ago" },
  { id: "#ORD-005", customer: "Lisa Thompson", items: 1, total: 49.99, status: "delivered" as const, date: "5 hours ago" },
];

const statusColors = {
  pending: "warning" as const,
  paid: "info" as const,
  shipped: "default" as const,
  delivered: "success" as const,
  cancelled: "danger" as const,
};

export function RecentOrdersTable() {
  return (
    <div className="bg-card border border-border rounded-[var(--radius-lg)] overflow-hidden">
      <div className="flex items-center justify-between p-5 lg:p-6 border-b border-border">
        <h3 className="font-heading font-semibold text-text">Recent Orders</h3>
        <Button variant="ghost" size="sm">View All</Button>
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
            {recentOrders.map((order) => (
              <tr key={order.id} className="border-b border-border/50 hover:bg-border/20 transition-colors">
                <td className="px-5 lg:px-6 py-3.5 font-medium text-text">{order.id}</td>
                <td className="px-5 lg:px-6 py-3.5 text-text-secondary">{order.customer}</td>
                <td className="px-5 lg:px-6 py-3.5 text-text-secondary hidden sm:table-cell">{order.items}</td>
                <td className="px-5 lg:px-6 py-3.5 font-medium text-text">{formatPrice(order.total)}</td>
                <td className="px-5 lg:px-6 py-3.5">
                  <Badge variant={statusColors[order.status]}>{order.status}</Badge>
                </td>
                <td className="px-5 lg:px-6 py-3.5 text-right">
                  <button className="p-1.5 hover:bg-border rounded transition-colors">
                    <Eye size={16} className="text-text-secondary" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
