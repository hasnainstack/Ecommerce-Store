"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, ShoppingBag, Users, Package } from "lucide-react";
import { api } from "@/lib/api";

interface DashboardData {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  total_products: number;
  revenue_change: number;
  orders_change: number;
  customers_change: number;
  products_change: number;
}

export function DashboardCards() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<DashboardData>("/admin/dashboard")
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);

  const formatCount = (val: number) =>
    val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toString();

  const stats = data
    ? [
        { label: "Total Revenue", value: formatCurrency(data.total_revenue), change: `${data.revenue_change >= 0 ? "+" : ""}${data.revenue_change}%`, icon: DollarSign, color: "from-green-500/20 to-emerald-500/10" },
        { label: "Total Orders", value: formatCount(data.total_orders), change: `${data.orders_change >= 0 ? "+" : ""}${data.orders_change}%`, icon: ShoppingBag, color: "from-blue-500/20 to-indigo-500/10" },
        { label: "Total Customers", value: formatCount(data.total_customers), change: `${data.customers_change >= 0 ? "+" : ""}${data.customers_change}%`, icon: Users, color: "from-purple-500/20 to-pink-500/10" },
        { label: "Active Products", value: formatCount(data.total_products), change: `${data.products_change >= 0 ? "+" : ""}${data.products_change}%`, icon: Package, color: "from-amber-500/20 to-orange-500/10" },
      ]
    : [];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {loading ? (
        <>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border border-border rounded-[var(--radius-lg)] p-5 lg:p-6 animate-pulse">
              <div className="w-10 h-10 bg-border rounded-[var(--radius-sm)] mb-4" />
              <div className="h-4 bg-border rounded w-24 mb-2" />
              <div className="h-7 bg-border rounded w-20 mb-2" />
              <div className="h-3 bg-border rounded w-16" />
            </div>
          ))}
        </>
      ) : (
        stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card border border-border rounded-[var(--radius-lg)] p-5 lg:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-[var(--radius-sm)] flex items-center justify-center`}>
                <stat.icon size={20} className="text-text" />
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                stat.change.startsWith("+") ? "text-success bg-success/10" : "text-danger bg-danger/10"
              }`}>
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-heading font-bold text-text mb-1">{stat.value}</p>
            <p className="text-sm text-text-secondary">{stat.label}</p>
          </motion.div>
        ))
      )}
    </div>
  );
}
