export const MEDICINE_CATALOGUE_CHANGED = "medicine-catalogue-changed";

export type MedicineState = {
  active?: boolean;
  is_active?: boolean;
  deleted?: boolean;
  is_deleted?: boolean;
  deleted_at?: string | null;
  deletedAt?: string | null;
  status?: string;
};

export function medicineUnavailable(medicine?: MedicineState | null): boolean {
  return Boolean(
    medicine &&
      (medicine.active === false ||
        medicine.is_active === false ||
        medicine.deleted === true ||
        medicine.is_deleted === true ||
        medicine.deleted_at ||
        medicine.deletedAt ||
        /^(deleted|removed|inactive|archived)$/i.test(medicine.status ?? "")),
  );
}

export function linkedMedicineUnavailable(record: {
  medicine?: MedicineState | null;
  medicine_deleted?: boolean;
  medicine_active?: boolean;
}): boolean {
  return (
    record.medicine_deleted === true ||
    record.medicine_active === false ||
    medicineUnavailable(record.medicine)
  );
}
