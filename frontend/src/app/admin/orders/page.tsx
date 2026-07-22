"use client";

import { Badge } from "@/components/ui";
import { formatPrice } from "@/lib/utils";

const orders = [
  { id: "#ORD-001", customer: "Sarah Johnson", email: "sarah@example.com", items: 3, total: 249.99, status: "paid" as const, date: "2026-07-22" },
  { id: "#ORD-002", customer: "Michael Chen", email: "michael@example.com", items: 1, total: 89.99, status: "shipped" as const, date: "2026-07-21" },
  { id: "#ORD-003", customer: "Emily Rodriguez", email: "emily@example.com", items: 2, total: 159.98, status: "delivered" as const, date: "2026-07-20" },
  { id: "#ORD-004", customer: "David Kim", email: "david@example.com", items: 5, total: 429.95, status: "pending" as const, date: "2026-07-19" },
  { id: "#ORD-005", customer: "Lisa Thompson", email: "lisa@example.com", items: 1, total: 49.99, status: "delivered" as const, date: "2026-07-18" },
  { id: "#ORD-006", customer: "James Wilson", email: "james@example.com", items: 4, total: 319.96, status: "cancelled" as const, date: "2026-07-17" },
];

const statusColors = {
  pending: "warning" as const, paid: "info" as const, shipped: "default" as const,
  delivered: "success" as const, cancelled: "danger" as const,
};

export default function OrdersPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-text">Orders</h1>
        <p className="text-text-secondary text-sm mt-1">Manage customer orders</p>
      </div>

      <div className="bg-card border border-border rounded-[var(--radius-lg)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-text-secondary">
                <th className="text-left font-medium px-5 lg:px-6 py-3.5">Order</th>
                <th className="text-left font-medium px-5 lg:px-6 py-3.5">Customer</th>
                <th className="text-left font-medium px-5 lg:px-6 py-3.5 hidden sm:table-cell">Items</th>
                <th className="text-left font-medium px-5 lg:px-6 py-3.5">Total</th>
                <th className="text-left font-medium px-5 lg:px-6 py-3.5">Status</th>
                <th className="text-left font-medium px-5 lg:px-6 py-3.5 hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border/50 hover:bg-border/20 transition-colors">
                  <td className="px-5 lg:px-6 py-3.5 font-medium text-text">{order.id}</td>
                  <td className="px-5 lg:px-6 py-3.5">
                    <div>
                      <p className="text-text">{order.customer}</p>
                      <p className="text-xs text-text-secondary">{order.email}</p>
                    </div>
                  </td>
                  <td className="px-5 lg:px-6 py-3.5 text-text-secondary hidden sm:table-cell">{order.items}</td>
                  <td className="px-5 lg:px-6 py-3.5 font-medium text-text">{formatPrice(order.total)}</td>
                  <td className="px-5 lg:px-6 py-3.5">
                    <Badge variant={statusColors[order.status]}>{order.status}</Badge>
                  </td>
                  <td className="px-5 lg:px-6 py-3.5 text-text-secondary hidden md:table-cell">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
