"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import type { ModalId } from "@/app/lib/types";
import { REPORT_SERVICE } from "@/app/services/report-service/report-service";
import { TRANSFER_SERVICE } from "@/app/services/transfer-service/transfer-service";
import { INVENTORY_SERVICE } from "@/app/services/inventory-service/inventory-service";
import { PRESCRIPTION_SERVICE } from "@/app/services/prescription-service/prescription-service";
import { NOTIFICATION_SERVICE } from "@/app/services/notification-service/notification-service";
import { unwrapArray } from "@/app/services/response-utils";
import { MEDICINE_SERVICE } from "@/app/services/medicine-service/medicine-service";
import { NETWORK_SERVICE } from "@/app/services/network-service/network-service";
import { useProvider } from "@/app/providers/provider";
import { BellOff, FilePlus2 } from "lucide-react";
import EmptyState from "@/app/components/EmptyState";

interface Props {
  openModalId: ModalId | null;
  onCloseModal: (id: ModalId) => void;
}
const TITLES: Record<ModalId, string> = {
  "modal-export": "Export report",
  "modal-transfer": "New transfer request",
  "modal-breach": "Dispose quarantined inventory",
  "modal-prescription": "Create prescription",
  "modal-notifications": "Notifications",
  "modal-onboard": "Onboard a facility",
  "modal-user": "Invite a user",
};

export default function Modals({ openModalId, onCloseModal }: Props) {
  const [values, setValues] = useState<Record<string, string>>({
    type: "CSV",
    from: "",
    to: "",
    quantity: "1",
    tnmStage: "",
    insurer: "",
    icd10: "",
  });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [loadingPrescriptionOptions, setLoadingPrescriptionOptions] =
    useState(false);
  const [prescriptionOptionsMessage, setPrescriptionOptionsMessage] =
    useState("");
  const { userData } = useProvider();
  const set =
    (key: string) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) =>
      setValues((current) => ({ ...current, [key]: event.target.value }));

  useEffect(() => {
    if (openModalId !== "modal-notifications") return;
    void NOTIFICATION_SERVICE.list().then((response) => {
      if (response.success) setNotifications(unwrapArray(response.data));
      else setMessage(response.message || "Notifications could not be loaded.");
    });
  }, [openModalId]);

  useEffect(() => {
    if (openModalId !== "modal-prescription") return;
    let current = true;
    setLoadingPrescriptionOptions(true);
    setMedicines([]);
    setPharmacies([]);
    setPrescriptionOptionsMessage("");
    void Promise.all([MEDICINE_SERVICE.list(), NETWORK_SERVICE.getNetwork()])
      .then(([medicineResponse, networkResponse]) => {
        if (!current) return;
        if (medicineResponse.success)
          setMedicines(unwrapArray(medicineResponse.data));
        else
          setPrescriptionOptionsMessage(
            medicineResponse.message || "Medicine catalog could not be loaded.",
          );
        if (networkResponse.success) {
          const networkFacilities =
            (networkResponse.data as any)?.facilities ?? networkResponse.data;
          const activePharmacies = unwrapArray(networkFacilities).filter(
            (facility: any) =>
              (facility.facility_type ?? facility.facilityType) ===
                "PHARMACY" && (facility.status ?? "ACTIVE") === "ACTIVE",
          );
          setPharmacies(activePharmacies);
          const ownFacilityId = userData.user?.hospital?.id;
          if (
            ownFacilityId &&
            activePharmacies.some((item: any) => item.id === ownFacilityId)
          )
            setValues((currentValues) => ({
              ...currentValues,
              pharmacyFacilityId:
                currentValues.pharmacyFacilityId || ownFacilityId,
            }));
        } else {
          setPrescriptionOptionsMessage(
            networkResponse.message ||
              "Pharmacy facilities could not be loaded.",
          );
        }
      })
      .finally(() => {
        if (current) setLoadingPrescriptionOptions(false);
      });
    return () => {
      current = false;
    };
  }, [openModalId, userData.user?.hospital?.id]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    let response;
    if (openModalId === "modal-export")
      response = await REPORT_SERVICE.export({
        type: values.type,
        from: values.from,
        to: values.to,
      });
    else if (openModalId === "modal-transfer")
      response = await TRANSFER_SERVICE.create({
        inventoryItemId: values.inventoryItemId,
        recipientFacilityId: values.recipientFacilityId,
        quantity: Number(values.quantity),
      });
    else if (openModalId === "modal-breach")
      response = await INVENTORY_SERVICE.dispose(values.inventoryItemId);
    else if (openModalId === "modal-prescription")
      response = await PRESCRIPTION_SERVICE.create({
        patient_ref: values.patientRef,
        icd10: values.icd10,
        tnm_stage: values.tnmStage,
        insurer: values.insurer,
        drug_id: values.drugId,
        qty: Number(values.quantity),
        pharmacy_facility_id: values.pharmacyFacilityId,
        ...(userData.user?.id ? { prescriber_id: userData.user.id } : {}),
      });
    if (response && openModalId === "modal-export" && response.success) {
      const csv = (response.data as any)?.csv;
      if (csv) {
        const blob = new Blob([csv], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "oncosourz-report.csv";
        link.click();
        URL.revokeObjectURL(link.href);
      }
    }
    if (response)
      setMessage(
        response.message ||
          (response.success ? "Request completed." : "Request failed."),
      );
    if (response?.success && openModalId === "modal-prescription") {
      window.dispatchEvent(new Event("prescriptions:updated"));
      setValues((current) => ({
        ...current,
        patientRef: "",
        icd10: "",
        tnmStage: "",
        insurer: "",
        drugId: "",
        quantity: "1",
      }));
    }
    setBusy(false);
  };

  if (!openModalId) return null;
  const field = (
    key: string,
    label: string,
    placeholder = "",
    type = "text",
  ) => (
    <label className="mb-3 block text-xs font-semibold text-g600" key={key}>
      {label}
      <input
        className="mt-1 w-full rounded-lg border border-g200 px-3 py-2.5 text-sm font-normal"
        type={type}
        value={values[key] ?? ""}
        onChange={set(key)}
        pattern={key === "icd10" ? "^C\\d{2}(\\.\\d{1,2})?$" : undefined}
        min={type === "number" ? 1 : undefined}
        step={type === "number" ? 1 : undefined}
        placeholder={placeholder}
        required
      />
    </label>
  );
  const select = (key: string, label: string, options: string[]) => (
    <label className="mb-3 block text-xs font-semibold text-g600" key={key}>
      {label}
      <select
        className="mt-1 w-full rounded-lg border border-g200 bg-white px-3 py-2.5 text-sm font-normal"
        value={values[key] ?? ""}
        onChange={set(key)}
        required
      >
        <option value="" disabled>
          Select {label.toLowerCase()}
        </option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
  const isForm = [
    "modal-export",
    "modal-transfer",
    "modal-breach",
    "modal-prescription",
  ].includes(openModalId);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 p-4"
      onClick={() => onCloseModal(openModalId)}
    >
      <section
        className="max-h-[90vh] w-full max-w-[520px] overflow-y-auto rounded-2xl bg-w shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-g100 bg-g50/70 px-6 py-5">
          <h2 className="flex items-center gap-2 text-[15px] font-bold text-g900">
            {openModalId === "modal-prescription" ? (
              <FilePlus2 className="size-4 text-p" aria-hidden="true" />
            ) : null}
            {TITLES[openModalId]}
          </h2>
          <button
            className="text-g500"
            onClick={() => onCloseModal(openModalId)}
            type="button"
            aria-label="Close"
          >
            ✕
          </button>
        </header>
        {openModalId === "modal-onboard" ? (
          <div className="p-6">
            <p className="text-sm leading-6 text-g600">
              Facility registration collects licence and administrator details
              together so the backend can create the facility and user in one
              transaction.
            </p>
            <a
              className="mt-4 inline-block rounded-lg bg-p px-4 py-2 text-sm font-semibold text-white"
              href="/register"
            >
              Continue to facility registration
            </a>
          </div>
        ) : null}
        {openModalId === "modal-notifications" ? (
          <div className="p-6">
            {notifications.map((notification) => (
              <article
                className="flex items-start justify-between gap-3 border-b border-g100 py-3"
                key={notification.id}
              >
                <div>
                  <p className="text-sm font-semibold text-g800">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-xs text-g500">{notification.body}</p>
                </div>
                {!notification.read_at ? (
                  <button
                    className="text-xs font-semibold text-p"
                    onClick={() =>
                      void NOTIFICATION_SERVICE.markRead(notification.id).then(
                        (response) => {
                          if (response.success)
                            setNotifications((list) =>
                              list.map((item) =>
                                item.id === notification.id
                                  ? {
                                      ...item,
                                      read_at: new Date().toISOString(),
                                    }
                                  : item,
                              ),
                            );
                        },
                      )
                    }
                    type="button"
                  >
                    Mark read
                  </button>
                ) : null}
              </article>
            ))}
            {!notifications.length ? (
              <EmptyState
                compact
                icon={BellOff}
                title="You're all caught up"
                description="New account notifications will appear here."
              />
            ) : null}
          </div>
        ) : null}
        {openModalId === "modal-user" ? (
          <div className="p-6">
            <p className="text-sm leading-6 text-g600">
              The connected API supports listing and updating users, but it does
              not expose a user invitation endpoint yet.
            </p>
          </div>
        ) : null}
        {isForm ? (
          <form className="p-6" onSubmit={(event) => void submit(event)}>
            {openModalId === "modal-export" ? (
              <>
                {select("type", "Report type", ["CSV", "PDF", "XLSX"])}
                {field("from", "From date", "", "date")}
                {field("to", "To date", "", "date")}
              </>
            ) : null}
            {openModalId === "modal-transfer" ? (
              <>
                {field("inventoryItemId", "Inventory item ID", "UUID")}
                {field("recipientFacilityId", "Recipient facility ID", "UUID")}
                {field("quantity", "Quantity", "1", "number")}
              </>
            ) : null}
            {openModalId === "modal-breach" ? (
              <>
                {field(
                  "inventoryItemId",
                  "Quarantined inventory item ID",
                  "UUID",
                )}
                <p className="mb-3 text-xs text-err">
                  Disposal is irreversible. Confirm the correct inventory item
                  before continuing.
                </p>
              </>
            ) : null}
            {openModalId === "modal-prescription" ? (
              <>
                {field(
                  "patientRef",
                  "Pseudonymized patient reference",
                  "Enter a coded reference (no patient name)",
                )}
                {field("icd10", "ICD-10 diagnosis", "Enter diagnosis code")}
                {field("tnmStage", "TNM stage", "Enter clinical stage")}
                {select("insurer", "Insurer", [
                  "AXA Mansard",
                  "Hygeia",
                  "NHIA",
                  "Reliance",
                  "Cash Pay",
                ])}
                <label className="mb-3 block text-xs font-semibold text-g600">
                  Medicine
                  <select
                    className="mt-1 w-full rounded-lg border border-g200 bg-w px-3 py-2.5 text-sm font-normal"
                    value={values.drugId ?? ""}
                    onChange={set("drugId")}
                    required
                  >
                    <option value="" disabled>
                      {loadingPrescriptionOptions
                        ? "Loading medicine catalog…"
                        : medicines.length
                          ? "Select a medicine"
                          : "No medicines available"}
                    </option>
                    {medicines.map((medicine) => (
                      <option key={medicine.id} value={medicine.id}>
                        {medicine.generic_name ?? medicine.name ?? "Medicine"}
                        {medicine.strength ? ` · ${medicine.strength}` : ""}
                        {medicine.brand ? ` (${medicine.brand})` : ""}
                      </option>
                    ))}
                  </select>
                </label>
                {field("quantity", "Quantity", "1", "number")}
                <label className="mb-3 block text-xs font-semibold text-g600">
                  Pharmacy
                  <select
                    className="mt-1 w-full rounded-lg border border-g200 bg-w px-3 py-2.5 text-sm font-normal"
                    value={values.pharmacyFacilityId ?? ""}
                    onChange={set("pharmacyFacilityId")}
                    required
                  >
                    <option value="" disabled>
                      {loadingPrescriptionOptions
                        ? "Loading pharmacies…"
                        : "Select a verified pharmacy"}
                    </option>
                    {pharmacies.map((facility) => (
                      <option key={facility.id} value={facility.id}>
                        {facility.name ?? facility.hospital_name ?? "Pharmacy"}
                        {facility.city ? ` · ${facility.city}` : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="mb-3 text-xs leading-5 text-g500">
                  Your signed-in account will be recorded as the prescriber. Use
                  a coded patient reference; do not enter a patient name.
                </p>
                {prescriptionOptionsMessage ? (
                  <p className="mb-3 text-xs text-err" role="alert">
                    {prescriptionOptionsMessage}
                  </p>
                ) : null}
              </>
            ) : null}
            {message ? (
              <p role="status" className="mb-3 text-sm text-g600">
                {message}
              </p>
            ) : null}
            <footer className="flex justify-end gap-2 border-t border-g100 pt-4">
              <button
                className="rounded-lg border border-g200 px-4 py-2 text-sm text-g700"
                onClick={() => onCloseModal(openModalId)}
                type="button"
              >
                Close
              </button>
              <button
                disabled={busy}
                className="rounded-lg bg-p px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                type="submit"
              >
                {busy ? "Working…" : "Submit"}
              </button>
            </footer>
          </form>
        ) : null}
      </section>
    </div>
  );
}
