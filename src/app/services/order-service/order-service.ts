import { CoreService } from "@/app/hooks/service/core-service";
import { Routes } from "../api-routes";

export const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;
export const PAYMENT_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export interface Order {
  id: string;
  reference: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  paymentStatus: (typeof PAYMENT_STATUSES)[number];
  currency: string | null;
  totalMinor: number | null;
  buyer: { name: string; facilityName: string | null };
  seller: { name: string };
  itemCount: number;
}
export interface OrderDetail extends Order {
  version: number;
  items: {
    id: string;
    name: string;
    strength: string | null;
    quantity: number;
    unit: string | null;
    unitPriceMinor: number | null;
    totalMinor: number | null;
  }[];
  subtotalMinor: number | null;
  deliveryFeeMinor: number | null;
  paymentReference: string | null;
  paidAt: string | null;
  delivery: {
    recipientName: string | null;
    address: string | null;
    carrier: string | null;
    trackingNumber: string | null;
    estimatedDeliveryAt: string | null;
    deliveredAt: string | null;
  } | null;
  timeline: {
    id: string;
    status: string;
    message: string;
    occurredAt: string;
  }[];
  allowedTransitions: OrderStatus[];
}
export interface OrderPage {
  items: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
export interface FulfillmentUpdate {
  status: OrderStatus;
  expectedVersion: number;
  note: string;
  carrier?: string;
  trackingNumber?: string;
}

class OrderService extends CoreService {
  list(params: URLSearchParams, admin = false) {
    return this.get(
      admin
        ? Routes.ADMIN_ORDERS(params.toString())
        : Routes.ORDERS(params.toString()),
      admin ? { admin: true } : { facilityOnly: true },
    );
  }
  detail(orderId: string, admin = false) {
    return this.get(
      admin ? Routes.ADMIN_ORDER(orderId) : Routes.ORDER(orderId),
      admin ? { admin: true } : { facilityOnly: true },
    );
  }
  updateFulfillment(orderId: string, payload: FulfillmentUpdate) {
    return this.update(Routes.ADMIN_ORDER_FULFILLMENT(orderId), payload, {
      admin: true,
    });
  }
}
export const ORDER_SERVICE = new OrderService();
