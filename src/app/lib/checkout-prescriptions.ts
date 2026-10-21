export const isPrescriptionUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export type CheckoutPrescription = { id: string; label: string };
type PrescriptionRecord = {
  id?: string;
  display_id?: string;
  code?: string;
  drug?: string;
  drug_id?: string;
  medicine_id?: string;
  medicine?: { id?: string; generic_name?: string };
  auth_status?: string;
  authorization_status?: string;
  status?: string;
  order_stage?: string;
  order?: string;
};

export function checkoutPrescriptions(
  rows: PrescriptionRecord[],
  medicineId?: string,
): CheckoutPrescription[] {
  return rows.flatMap((row) => {
    if (typeof row.id !== "string" || !isPrescriptionUuid(row.id)) return [];
    const approval = String(
      row.auth_status ?? row.authorization_status ?? row.status ?? "",
    )
      .trim()
      .toUpperCase();
    const stage = String(row.order_stage ?? row.order ?? "")
      .trim()
      .toUpperCase()
      .replaceAll(" ", "_");
    if (
      !["APPROVED", "AUTHORIZED", "AUTHORISED", "CLEARED"].includes(approval) ||
      [
        "DISPENSED",
        "DELIVERED",
        "COMPLETED",
        "CANCELLED",
        "CANCELED",
        "REJECTED",
      ].includes(stage)
    )
      return [];
    const drugId = row.drug_id ?? row.medicine_id ?? row.medicine?.id;
    if (medicineId && drugId && String(drugId) !== medicineId) return [];
    const name =
      row.medicine?.generic_name ??
      (typeof row.drug === "string" ? row.drug : undefined);
    return [
      {
        id: row.id,
        label: [
          row.display_id ?? row.code ?? `Prescription ${row.id.slice(0, 8)}`,
          name,
        ]
          .filter(Boolean)
          .join(" · "),
      },
    ];
  });
}
