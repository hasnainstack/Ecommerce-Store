"use client";

import { useAuthStore } from "@/stores/auth";
import { Button, Card } from "@/components/ui";
import { User, Mail, Shield, Calendar, LogOut, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();

  if (!isAuthenticated()) {
    router.push("/login");
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <h1 className="text-3xl font-heading font-bold text-text mb-8">My Profile</h1>

      <div className="space-y-6">
        {/* Profile Card */}
        <Card className="p-6 lg:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
              <span className="text-2xl font-heading font-bold text-primary">
                {user?.email?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-heading font-semibold text-text">{user?.email?.split("@")[0] || "User"}</h2>
              <p className="text-text-secondary text-sm">{user?.email}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Mail, label: "Email", value: user?.email },
              { icon: Shield, label: "Role", value: user?.role },
              { icon: Calendar, label: "Member since", value: "2026" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-3 bg-bg rounded-[var(--radius-sm)]">
                <item.icon size={18} className="text-text-secondary shrink-0" />
                <div>
                  <p className="text-xs text-text-secondary">{item.label}</p>
                  <p className="text-sm font-medium text-text">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Links */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/orders">
            <Card className="p-5 hover:shadow-hover hover:-translate-y-1 transition-all duration-300 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-[var(--radius-sm)] flex items-center justify-center">
                <ShoppingBag size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-text">My Orders</h3>
                <p className="text-sm text-text-secondary">View order history</p>
              </div>
            </Card>
          </Link>

          {user?.role === "admin" && (
            <Link href="/admin">
              <Card className="p-5 hover:shadow-hover hover:-translate-y-1 transition-all duration-300 flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-[var(--radius-sm)] flex items-center justify-center">
                  <Shield size={24} className="text-accent" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-text">Admin Panel</h3>
                  <p className="text-sm text-text-secondary">Manage store</p>
                </div>
              </Card>
            </Link>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={() => { logout(); router.push("/"); }}
          className="flex items-center gap-2 text-danger hover:text-red-600 transition-colors text-sm font-medium"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
