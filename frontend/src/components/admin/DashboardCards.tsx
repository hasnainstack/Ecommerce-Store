"use client";

import { motion } from "framer-motion";
import { DollarSign, ShoppingBag, Users, Package } from "lucide-react";

const stats = [
  { label: "Total Revenue", value: "$48,250", change: "+12.5%", icon: DollarSign, color: "from-green-500/20 to-emerald-500/10" },
  { label: "Total Orders", value: "1,423", change: "+8.2%", icon: ShoppingBag, color: "from-blue-500/20 to-indigo-500/10" },
  { label: "Total Customers", value: "3,582", change: "+15.3%", icon: Users, color: "from-purple-500/20 to-pink-500/10" },
  { label: "Active Products", value: "247", change: "+3.1%", icon: Package, color: "from-amber-500/20 to-orange-500/10" },
];

export function DashboardCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {stats.map((stat, i) => (
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
            <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
              {stat.change}
            </span>
          </div>
          <p className="text-2xl lg:text-3xl font-heading font-bold text-text">{stat.value}</p>
          <p className="text-sm text-text-secondary mt-1">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
