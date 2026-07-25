"use client";

import { CheckCircle2, Clock, XCircle, Truck, Package, RotateCcw, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/types/order";
import type { OrderStatusHistoryRead, OrderStatus } from "@/types/order";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_ICONS: Record<string, typeof CheckCircle2> = {
  pending: Clock,
  confirmed: CheckCircle2,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
  refunded: RotateCcw,
};

interface OrderTimelineProps {
  history: OrderStatusHistoryRead[];
}

export function OrderTimeline({ history }: OrderTimelineProps) {
  if (!history.length) {
    return (
      <p className="text-sm text-text-secondary italic">No status history available.</p>
    );
  }

  // Display newest first
  const sorted = [...history].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="relative">
      {sorted.map((entry, i) => {
        const Icon = STATUS_ICONS[entry.to_status] || CheckCircle2;
        const isLatest = i === 0;

        return (
          <div key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Timeline line */}
            {i < sorted.length - 1 && (
              <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
            )}

            {/* Icon dot */}
            <div
              className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                isLatest
                  ? "bg-primary text-white"
                  : "bg-border/50 text-text-secondary"
              }`}
            >
              <Icon size={14} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                {entry.from_status && (
                  <>
                    <Badge
                      variant={ORDER_STATUS_COLORS[entry.from_status as OrderStatus] ?? "default"}
                    >
                      {ORDER_STATUS_LABELS[entry.from_status as OrderStatus] ?? entry.from_status}
                    </Badge>
                    <ChevronRight size={14} className="text-text-secondary shrink-0" />
                  </>
                )}
                <Badge
                  variant={ORDER_STATUS_COLORS[entry.to_status as OrderStatus] ?? "default"}
                >
                  {ORDER_STATUS_LABELS[entry.to_status as OrderStatus] ?? entry.to_status}
                </Badge>
              </div>

              <p className="text-xs text-text-secondary mt-1">
                <span className="font-medium text-text-secondary/80">{entry.changed_by}</span>
                {" · "}
                {formatDate(entry.created_at)}
              </p>

              {entry.reason && (
                <p className="text-sm text-text-secondary mt-1.5 bg-border/20 rounded-[var(--radius-sm)] px-3 py-2">
                  {entry.reason}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
