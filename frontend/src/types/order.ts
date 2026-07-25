/* ── Order Status ─────────────────────────────────────── */

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

/** Valid next transitions by current status. */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled", "refunded"],
  processing: ["shipped", "cancelled", "refunded"],
  shipped: ["delivered", "cancelled", "refunded"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, "default" | "success" | "warning" | "danger" | "info"> = {
  pending: "warning",
  confirmed: "info",
  processing: "info",
  shipped: "default",
  delivered: "success",
  cancelled: "danger",
  refunded: "info",
};

/* ── API Types ────────────────────────────────────────── */

export interface OrderItemRead {
  id: number;
  product_id: number | null;
  variant_id: number | null;
  product_name: string;
  product_slug: string;
  product_image_url: string;
  variant_attributes: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

export interface OrderStatusHistoryRead {
  id: number;
  from_status: string | null;
  to_status: string;
  changed_by: string;
  reason: string;
  created_at: string;
}

export interface OrderRead {
  id: number;
  user_id: number;
  status: OrderStatus;
  total_amount: number;
  shipping_address: string;
  created_at: string;
  items: OrderItemRead[];
  status_history: OrderStatusHistoryRead[];
}

export interface AdminOrderRead extends OrderRead {
  customer_email: string;
  customer_name: string;
  tracking_number: string;
  tracking_carrier: string;
  admin_notes: string;
}

export interface AdminOrderListResponse {
  data: AdminOrderRead[];
  total: number;
}

export interface OrderStatusUpdateResponse {
  order: OrderRead;
  history: OrderStatusHistoryRead;
}
