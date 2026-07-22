"use client";

import { Badge } from "@/components/ui";

const customers = [
  { name: "Sarah Johnson", email: "sarah@example.com", orders: 12, spent: 2450.00, joined: "2026-01-15", status: "active" as const },
  { name: "Michael Chen", email: "michael@example.com", orders: 8, spent: 1890.50, joined: "2026-02-20", status: "active" as const },
  { name: "Emily Rodriguez", email: "emily@example.com", orders: 15, spent: 3200.75, joined: "2025-11-03", status: "active" as const },
  { name: "David Kim", email: "david@example.com", orders: 3, spent: 529.95, joined: "2026-06-10", status: "active" as const },
  { name: "Lisa Thompson", email: "lisa@example.com", orders: 7, spent: 1120.00, joined: "2026-03-22", status: "inactive" as const },
];

export default function CustomersPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-text">Customers</h1>
        <p className="text-text-secondary text-sm mt-1">View your customer base</p>
      </div>

      <div className="bg-card border border-border rounded-[var(--radius-lg)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-text-secondary">
                <th className="text-left font-medium px-5 lg:px-6 py-3.5">Customer</th>
                <th className="text-left font-medium px-5 lg:px-6 py-3.5">Orders</th>
                <th className="text-left font-medium px-5 lg:px-6 py-3.5">Spent</th>
                <th className="text-left font-medium px-5 lg:px-6 py-3.5 hidden sm:table-cell">Joined</th>
                <th className="text-left font-medium px-5 lg:px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.email} className="border-b border-border/50 hover:bg-border/20 transition-colors">
                  <td className="px-5 lg:px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center font-heading font-semibold text-sm text-text">
                        {c.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-text font-medium">{c.name}</p>
                        <p className="text-xs text-text-secondary">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 lg:px-6 py-3.5 text-text">{c.orders}</td>
                  <td className="px-5 lg:px-6 py-3.5 font-medium text-text">${c.spent.toFixed(2)}</td>
                  <td className="px-5 lg:px-6 py-3.5 text-text-secondary hidden sm:table-cell">{c.joined}</td>
                  <td className="px-5 lg:px-6 py-3.5">
                    <Badge variant={c.status === "active" ? "success" : "danger"}>{c.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
