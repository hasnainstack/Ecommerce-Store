"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, RefreshCw, Activity, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useUIStore } from "@/stores/ui";
import { api } from "@/lib/api";

interface ActivityItem {
  id: number;
  actor_id: number | null;
  actor_email: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: string;
  ip_address: string;
  created_at: string;
}

interface ActivityResponse {
  items: ActivityItem[];
  total: number;
  page: number;
  per_page: number;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

const ACTION_LABELS: Record<string, string> = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  status_change: "Status Change",
  login: "Login",
};

const ENTITY_ICONS: Record<string, string> = {
  product: "📦",
  order: "🛒",
  settings: "⚙️",
  media: "🖼️",
  page: "📄",
  user: "👤",
};

function getDetailsPreview(details: string): string {
  if (!details) return "-";
  try {
    const d = JSON.parse(details);
    const parts: string[] = [];
    if (d.name) parts.push(d.name);
    if (d.title) parts.push(d.title);
    if (d.original_name) parts.push(d.original_name);
    if (d.updated_fields) parts.push(`fields: ${d.updated_fields.join(", ")}`);
    if (d.count) parts.push(`${d.count} items`);
    if (d.to) parts.push(`→ ${d.to}`);
    return parts.join(" ") || details.slice(0, 80);
  } catch {
    return details.slice(0, 80);
  }
}

export default function ActivityPage() {
  const { showToast } = useUIStore();
  const [data, setData] = useState<ActivityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [page, setPage] = useState(1);

  const fetchActivity = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("per_page", "50");
      if (search) params.set("search", search);
      if (actionFilter) params.set("action", actionFilter);
      if (entityFilter) params.set("entity_type", entityFilter);

      const result = await api.get<ActivityResponse>(`/admin/activity?${params}`);
      setData(result);
    } catch {
      showToast("Failed to load activity log", "error");
    } finally {
      setLoading(false);
    }
  }, [page, search, actionFilter, entityFilter, showToast]);

  useEffect(() => { fetchActivity(); }, [fetchActivity]);

  const totalPages = data ? Math.ceil(data.total / data.per_page) : 1;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text">Activity Log</h1>
          <p className="text-text-secondary text-sm mt-1">Track changes made across your store</p>
        </div>
        <Button variant="secondary" onClick={fetchActivity} loading={loading}>
          <RefreshCw size={16} className="mr-1.5" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search actor, details..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-10 pl-10 pr-4 bg-card border border-border rounded-[var(--radius-sm)] text-text placeholder:text-text-secondary/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="h-10 px-3 bg-card border border-border rounded-[var(--radius-sm)] text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">All Actions</option>
          <option value="create">Created</option>
          <option value="update">Updated</option>
          <option value="delete">Deleted</option>
          <option value="status_change">Status Change</option>
        </select>
        <select
          value={entityFilter}
          onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
          className="h-10 px-3 bg-card border border-border rounded-[var(--radius-sm)] text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">All Types</option>
          <option value="product">Product</option>
          <option value="order">Order</option>
          <option value="settings">Settings</option>
          <option value="media">Media</option>
          <option value="page">Page</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-[var(--radius-lg)]" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="bg-card border border-border rounded-[var(--radius-lg)] p-16 text-center">
          <Activity size={40} className="mx-auto mb-3 text-text-secondary/40" />
          <p className="text-text-secondary">No activity recorded yet.</p>
          <p className="text-text-secondary/60 text-sm mt-1">
            Actions like creating products or updating settings will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-card border border-border rounded-[var(--radius-lg)] overflow-hidden divide-y divide-border">
            {data.items.map((item) => (
              <div key={item.id} className="flex items-start gap-4 px-5 py-4 hover:bg-surface/30 transition-colors">
                <span className="text-lg shrink-0 mt-0.5">
                  {ENTITY_ICONS[item.entity_type] || "📋"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-text">{item.actor_email || "System"}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      item.action === "create" ? "bg-success/10 text-success" :
                      item.action === "delete" ? "bg-danger/10 text-danger" :
                      item.action === "status_change" ? "bg-primary/10 text-primary" :
                      "bg-border/50 text-text-secondary"
                    }`}>
                      {ACTION_LABELS[item.action] || item.action}
                    </span>
                    <span className="text-sm text-text-secondary">
                      {item.entity_type}
                      {item.entity_id && <span className="text-text-secondary/60"> #{item.entity_id}</span>}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary/70 mt-0.5 truncate">
                    {getDetailsPreview(item.details)}
                  </p>
                </div>
                <div className="text-xs text-text-secondary/50 shrink-0 text-right">
                  <p>{formatDate(item.created_at)}</p>
                  {item.ip_address && <p className="mt-0.5">{item.ip_address}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-text-secondary px-3">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
