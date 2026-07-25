"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Package, Truck, Save, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { OrderTimeline } from "@/components/admin/OrderTimeline";
import { formatPrice } from "@/lib/utils";
import { api } from "@/lib/api";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  ORDER_TRANSITIONS,
} from "@/types/order";
import { useUIStore } from "@/stores/ui";
import type {
  AdminOrderRead,
  OrderStatus,
  OrderStatusUpdateResponse,
} from "@/types/order";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function resolveImageUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_BASE}${url}`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useUIStore();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<AdminOrderRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Status change modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState<OrderStatus | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Tracking & notes
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingCarrier, setTrackingCarrier] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<AdminOrderRead>(`/orders/admin/${orderId}`);
      setOrder(res);
      setTrackingNumber(res.tracking_number || "");
      setTrackingCarrier(res.tracking_carrier || "");
      setAdminNotes(res.admin_notes || "");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId, fetchOrder]);

  const handleStatusChange = async () => {
    if (!targetStatus || !order) return;
    setSubmitting(true);
    try {
      const res = await api.patch<OrderStatusUpdateResponse>(
        `/orders/admin/${order.id}/status`,
        { status: targetStatus, reason }
      );
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              status: res.order.status,
              status_history: res.order.status_history,
            }
          : prev
      );
      setShowStatusModal(false);
      setTargetStatus(null);
      setReason("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update status";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDetails = async () => {
    setSavingDetails(true);
    try {
      const updated = await api.patch<AdminOrderRead>(`/orders/admin/${orderId}/details`, {
        tracking_number: trackingNumber,
        tracking_carrier: trackingCarrier,
        admin_notes: adminNotes,
      });
      setOrder(updated);
    } catch {
      showToast("Failed to save order details", "error");
    } finally {
      setSavingDetails(false);
    }
  };

  const openStatusModal = (status: OrderStatus) => {
    setTargetStatus(status);
    setReason("");
    setShowStatusModal(true);
  };

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 rounded-[var(--radius-lg)]" />
            <Skeleton className="h-64 rounded-[var(--radius-lg)]" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-[var(--radius-lg)]" />
            <Skeleton className="h-64 rounded-[var(--radius-lg)]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        <Button variant="ghost" onClick={() => router.push("/admin/orders")}>
          <ArrowLeft size={16} className="mr-1" />
          Back to Orders
        </Button>
        <div className="mt-6 p-6 bg-card border border-border rounded-[var(--radius-lg)] text-center">
          <p className="text-danger mb-2">{error || "Order not found"}</p>
          <Button variant="secondary" onClick={fetchOrder}>Retry</Button>
        </div>
      </div>
    );
  }

  const validTransitions = ORDER_TRANSITIONS[order.status] ?? [];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <Button variant="ghost" onClick={() => router.push("/admin/orders")}>
            <ArrowLeft size={16} className="mr-1" />
            Back to Orders
          </Button>
          <h1 className="text-2xl font-heading font-bold text-text mt-2">
            Order #{order.id}
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Placed on {formatDateTime(order.created_at)}
          </p>
        </div>
        <Badge variant={ORDER_STATUS_COLORS[order.status] ?? "default"} className="text-sm px-4 py-1.5">
          {ORDER_STATUS_LABELS[order.status] ?? order.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-card border border-border rounded-[var(--radius-lg)] p-5 lg:p-6">
            <h2 className="text-lg font-heading font-semibold text-text mb-4">Items</h2>
            <div className="divide-y divide-border/50">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="relative w-16 h-16 rounded-[var(--radius-sm)] overflow-hidden bg-border/30 flex-shrink-0">
                    {item.product_image_url ? (
                      <Image
                        src={resolveImageUrl(item.product_image_url)}
                        alt={item.product_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={20} className="text-text-secondary" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">
                      {item.product_name}
                    </p>
                    {item.variant_attributes && item.variant_attributes !== "{}" && (
                      <p className="text-xs text-text-secondary mt-0.5">
                        {(() => {
                          try {
                            const attrs = JSON.parse(item.variant_attributes);
                            return Object.entries(attrs).map(([k, v]) => `${k}: ${v}`).join(", ");
                          } catch { return ""; }
                        })()}
                      </p>
                    )}
                    <p className="text-xs text-text-secondary mt-0.5">
                      Qty: {item.quantity} × {formatPrice(item.unit_price)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-text">
                      {formatPrice(item.total_price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-4 mt-2 border-t border-border">
              <span className="text-base font-heading font-semibold text-text">Total</span>
              <span className="text-lg font-bold text-text">{formatPrice(order.total_amount)}</span>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-card border border-border rounded-[var(--radius-lg)] p-5 lg:p-6">
            <h2 className="text-lg font-heading font-semibold text-text mb-4">Status History</h2>
            <OrderTimeline history={order.status_history} />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Customer info */}
          <div className="bg-card border border-border rounded-[var(--radius-lg)] p-5 lg:p-6">
            <h2 className="text-lg font-heading font-semibold text-text mb-4">Customer</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-text-secondary uppercase tracking-wider">Name</p>
                <p className="text-sm text-text capitalize mt-0.5">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary uppercase tracking-wider">Email</p>
                <p className="text-sm text-text mt-0.5">{order.customer_email}</p>
              </div>
            </div>
          </div>

          {/* Shipping */}
          {order.shipping_address && (
            <div className="bg-card border border-border rounded-[var(--radius-lg)] p-5 lg:p-6">
              <h2 className="text-lg font-heading font-semibold text-text mb-4">Shipping</h2>
              <p className="text-sm text-text whitespace-pre-wrap">{order.shipping_address}</p>
            </div>
          )}

          {/* Tracking */}
          <div className="bg-card border border-border rounded-[var(--radius-lg)] p-5 lg:p-6">
            <h2 className="text-lg font-heading font-semibold text-text mb-4 flex items-center gap-2">
              <Truck size={16} />
              Tracking
            </h2>
            <div className="space-y-3">
              <Input
                id="tracking_carrier"
                label="Carrier"
                value={trackingCarrier}
                onChange={(e) => setTrackingCarrier(e.target.value)}
                placeholder="UPS, FedEx, USPS..."
              />
              <Input
                id="tracking_number"
                label="Tracking Number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="1Z999AA10123456784"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSaveDetails}
                loading={savingDetails}
                className="w-full"
              >
                <Save size={14} className="mr-1.5" />
                Save Tracking
              </Button>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="bg-card border border-border rounded-[var(--radius-lg)] p-5 lg:p-6">
            <h2 className="text-lg font-heading font-semibold text-text mb-4 flex items-center gap-2">
              <FileText size={16} />
              Notes
            </h2>
            <div className="space-y-3">
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal notes about this order..."
                rows={4}
                className="w-full px-4 py-2.5 bg-white border border-border rounded-[var(--radius-sm)] text-sm text-text placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSaveDetails}
                loading={savingDetails}
                className="w-full"
              >
                <Save size={14} className="mr-1.5" />
                Save Notes
              </Button>
            </div>
          </div>

          {/* Actions */}
          {validTransitions.length > 0 && (
            <div className="bg-card border border-border rounded-[var(--radius-lg)] p-5 lg:p-6">
              <h2 className="text-lg font-heading font-semibold text-text mb-4">Actions</h2>
              <div className="space-y-2">
                {validTransitions.map((status) => (
                  <Button
                    key={status}
                    variant="secondary"
                    className="w-full justify-start capitalize"
                    onClick={() => openStatusModal(status)}
                    loading={submitting && targetStatus === status}
                  >
                    Mark as {ORDER_STATUS_LABELS[status] ?? status}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Change Modal */}
      <Modal
        open={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title={`Change Status to ${
          targetStatus ? ORDER_STATUS_LABELS[targetStatus] ?? targetStatus : ""
        }`}
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            This will transition the order from{" "}
            <Badge variant={ORDER_STATUS_COLORS[order.status] ?? "default"}>
              {ORDER_STATUS_LABELS[order.status] ?? order.status}
            </Badge>{" "}
            to{" "}
            <Badge variant={targetStatus ? ORDER_STATUS_COLORS[targetStatus] ?? "default" : "default"}>
              {targetStatus ? ORDER_STATUS_LABELS[targetStatus] ?? targetStatus : ""}
            </Badge>.
          </p>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Reason (optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Customer requested cancellation"
              rows={3}
              className="w-full px-4 py-2.5 bg-white border border-border rounded-[var(--radius-sm)] text-sm text-text placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowStatusModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleStatusChange}
              loading={submitting}
            >
              Confirm Change
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
