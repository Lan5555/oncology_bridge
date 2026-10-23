/** Zero is a measurement; missing or invalid values must never become zero. */
export function adminMetric(value: unknown, money = false) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    (!money && !Number.isInteger(value))
  )
    return "Unavailable";
  return money
    ? new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
      }).format(value)
    : value.toLocaleString();
}
