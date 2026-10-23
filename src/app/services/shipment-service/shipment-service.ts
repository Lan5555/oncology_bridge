import { CoreService } from "@/app/hooks/service/core-service";
import { Routes } from "../api-routes";

export interface ShipmentReading {
  id: string;
  celsius: number;
  recordedAt: string;
  receivedAt: string;
  outOfRange: boolean;
}
export interface ShipmentMonitor {
  id: string;
  orderId: string | null;
  courierAssignmentId: string | null;
  reference: string | null;
  courier: { id: string; name: string };
  provider: string;
  deviceId: string;
  version: number;
  shipmentStatus: string;
  monitoringStatus:
    | "PENDING_INTEGRATION"
    | "AWAITING_DATA"
    | "RECEIVING"
    | "STALE"
    | "ENDED";
  temperatureStatus: "NO_DATA" | "IN_RANGE" | "OUT_OF_RANGE";
  limits: { minCelsius: number; maxCelsius: number };
  staleAfterSeconds: number;
  latestReading: ShipmentReading | null;
  excursionCount: number;
  lastSyncedAt: string | null;
  createdAt: string;
  providerConfigured: boolean;
  pollAfterSeconds: number;
}
export interface ShipmentEvent {
  id: string;
  readingId: string;
  type: string;
  message: string;
  celsius: number;
  occurredAt: string;
}
export interface ShipmentPage<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  monitoringStatus?: ShipmentMonitor["monitoringStatus"];
}
class ShipmentService extends CoreService {
  list(page = 1, admin = false) {
    return this.get(
      Routes.SHIPMENTS(page),
      admin ? { admin: true } : { facilityOnly: true },
    );
  }
  temperature(id: string, admin = false) {
    return this.get(
      Routes.SHIPMENT_TEMPERATURE(id),
      admin ? { admin: true } : { facilityOnly: true },
    );
  }
  history(id: string, page = 1, admin = false) {
    return this.get(
      Routes.SHIPMENT_HISTORY(id, page),
      admin ? { admin: true } : { facilityOnly: true },
    );
  }
  events(id: string, page = 1, admin = false) {
    return this.get(
      Routes.SHIPMENT_EVENTS(id, page),
      admin ? { admin: true } : { facilityOnly: true },
    );
  }
  sync(id: string) {
    return this.send(Routes.SHIPMENT_SYNC(id), {}, { admin: true });
  }
}
export const SHIPMENT_SERVICE = new ShipmentService();
