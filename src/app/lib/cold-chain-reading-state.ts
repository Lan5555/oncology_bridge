/** A missing storage policy must never imply that a temperature is safe. */
export function coldChainReadingState(
  reported: unknown,
  celsius: number,
  minimum: unknown,
  maximum: unknown,
): "NOMINAL" | "BREACH" | "OFFLINE" | "UNKNOWN" {
  if (reported === "NOMINAL" || reported === "BREACH" || reported === "OFFLINE")
    return reported;
  if (reported != null) return "UNKNOWN";
  if (
    ![minimum, maximum].every(
      (value) =>
        typeof value === "number" ||
        (typeof value === "string" && value.trim() !== ""),
    )
  )
    return "UNKNOWN";
  const low = Number(minimum);
  const high = Number(maximum);
  if (
    !Number.isFinite(celsius) ||
    !Number.isFinite(low) ||
    !Number.isFinite(high) ||
    low > high
  )
    return "UNKNOWN";
  return celsius < low || celsius > high ? "BREACH" : "NOMINAL";
}
