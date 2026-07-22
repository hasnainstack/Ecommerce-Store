"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Jan", revenue: 4000 },
  { name: "Feb", revenue: 3000 },
  { name: "Mar", revenue: 5500 },
  { name: "Apr", revenue: 4800 },
  { name: "May", revenue: 6000 },
  { name: "Jun", revenue: 7500 },
  { name: "Jul", revenue: 8200 },
];

export function RevenueChart() {
  return (
    <div className="bg-card border border-border rounded-[var(--radius-lg)] p-5 lg:p-6">
      <h3 className="font-heading font-semibold text-text mb-6">Revenue Overview</h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} />
            <YAxis stroke="#64748B" fontSize={12} tickLine={false} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "12px", boxShadow: "0 8px 30px rgba(15,23,42,0.08)" }}
              labelStyle={{ fontWeight: 600, color: "#0F172A" }}
            />
            <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} dot={{ fill: "#2563EB", strokeWidth: 2 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
