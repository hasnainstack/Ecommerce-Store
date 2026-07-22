"use client";

import { DashboardCards } from "@/components/admin/DashboardCards";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { RecentOrdersTable } from "@/components/admin/RecentOrdersTable";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-text">Dashboard</h1>
        <p className="text-text-secondary text-sm mt-1">Overview of your store performance</p>
      </div>

      <DashboardCards />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-[var(--radius-lg)] p-5 lg:p-6">
            <h3 className="font-heading font-semibold text-text mb-4">Quick Stats</h3>
            <div className="space-y-4">
              {[
                { label: "Avg. Order Value", value: "$86.42" },
                { label: "Conversion Rate", value: "3.24%" },
                { label: "Return Rate", value: "1.8%" },
                { label: "New Customers", value: "+156 this week" },
              ].map((s) => (
                <div key={s.label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <span className="text-sm text-text-secondary">{s.label}</span>
                  <span className="text-sm font-medium text-text">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <RecentOrdersTable />
    </div>
  );
}
