"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "@/lib/api";

interface MonthlyRevenue {
  month: string;
  revenue: number;
  orders: number;
}

interface DashboardData {
  monthly_revenue: MonthlyRevenue[];
}

export function RevenueChart() {
  const [data, setData] = useState<MonthlyRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<DashboardData>("/admin/dashboard")
      .then((res) => setData(res.monthly_revenue || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-[var(--radius-lg)] p-5 lg:p-6">
        <div className="h-6 bg-border rounded w-40 mb-6 animate-pulse" />
        <div className="h-[280px] bg-border/30 rounded animate-pulse" />
      </div>
    );
  }

  const formatTick = (val: number) => {
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val}`;
  };

  return (
    <div className="bg-card border border-border rounded-[var(--radius-lg)] p-5 lg:p-6">
      <h3 className="font-heading font-semibold text-text mb-6">Revenue Overview</h3>
      {data.length === 0 ? (
        <div className="h-[280px] flex items-center justify-center text-text-secondary text-sm">
          No revenue data yet
        </div>
      ) : (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={12} tickLine={false} tickFormatter={formatTick} />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "12px", boxShadow: "0 8px 30px rgba(15,23,42,0.08)" }}
                labelStyle={{ fontWeight: 600, color: "#0F172A" }}
                formatter={(value: unknown) => {
                  const n = Number(value);
                  return [`$${isNaN(n) ? "0" : n.toLocaleString()}`, "Revenue"];
                }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} dot={{ fill: "#2563EB", strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
