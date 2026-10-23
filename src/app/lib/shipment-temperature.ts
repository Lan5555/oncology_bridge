import type { ShipmentMonitor } from "../services/shipment-service/shipment-service";

export function shipmentTemperature(
  monitor: Pick<ShipmentMonitor, "latestReading" | "temperatureStatus">,
) {
  const sample = monitor.latestReading;
  if (
    !sample ||
    typeof sample.celsius !== "number" ||
    !Number.isFinite(sample.celsius) ||
    !sample.recordedAt ||
    Number.isNaN(Date.parse(sample.recordedAt))
  ) {
    return {
      value: "Unavailable",
      status: "No temperature data",
      recordedAt: null,
      outOfRange: false,
    };
  }
  return {
    value: `${sample.celsius.toLocaleString(undefined, { maximumFractionDigits: 2 })} °C`,
    status:
      monitor.temperatureStatus === "OUT_OF_RANGE" || sample.outOfRange
        ? "Outside configured range"
        : monitor.temperatureStatus === "IN_RANGE"
          ? "Within configured range"
          : "Range status unavailable",
    recordedAt: sample.recordedAt,
    outOfRange:
      monitor.temperatureStatus === "OUT_OF_RANGE" || sample.outOfRange,
  };
}

export function shipmentPollSeconds(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 1
    ? Math.min(Math.max(value, 5), 86400)
    : 30;
}
