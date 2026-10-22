export type TransferRecipient = {
  id: string;
  name: string;
  city: string | null;
  distanceKm: number | null;
};

/** Only use recipients returned by the transfer suggestion API. */
export function transferRecipients(data: unknown): TransferRecipient[] {
  const object = (value: unknown): Record<string, unknown> =>
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const root = object(data);
  const rows = Array.isArray(data)
    ? data
    : [
        root.recipients,
        root.suggestions,
        root.facilities,
        root.items,
        root.data,
      ].find(Array.isArray);
  if (!rows)
    throw new Error(
      "Recipient suggestions could not be read. Please try again.",
    );
  const result = rows.map((row): TransferRecipient => {
    const entry = object(row);
    const facility = entry.facility ? object(entry.facility) : entry;
    const id = facility.id ?? entry.facilityId;
    const name = facility.name ?? facility.hospital_name;
    const distance = entry.distanceKm ?? facility.distanceKm;
    if (
      typeof id !== "string" ||
      !id ||
      typeof name !== "string" ||
      !name.trim()
    ) {
      throw new Error(
        "Recipient suggestions are missing facility details. Please try again.",
      );
    }
    return {
      id,
      name,
      city: typeof facility.city === "string" ? facility.city : null,
      distanceKm:
        typeof distance === "number" &&
        Number.isFinite(distance) &&
        distance >= 0
          ? distance
          : null,
    };
  });
  return [
    ...new Map(result.map((recipient) => [recipient.id, recipient])).values(),
  ];
}
