"use client";

import { BellOff, FilePlus2 } from "lucide-react";

import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import EmptyState from "@/app/components/EmptyState";
import PrescriptionDescriptionField from "@/app/components/PrescriptionDescriptionField";
import ApiOptionSelect from "@/app/components/ApiOptionSelect";
import TransferRequestForm from "@/app/components/TransferRequestForm";
import type { ModalId, PageId } from "@/app/lib/types";
import { reportDownload } from "@/app/lib/report-download";
import { medicineUnavailable } from "@/app/lib/medicine-availability";
import { useProvider } from "@/app/providers/provider";
import { INVENTORY_SERVICE } from "@/app/services/inventory-service/inventory-service";
import { MEDICINE_SERVICE } from "@/app/services/medicine-service/medicine-service";
import { NOTIFICATION_SERVICE } from "@/app/services/notification-service/notification-service";
import { PRESCRIPTION_SERVICE } from "@/app/services/prescription-service/prescription-service";
import { REPORT_SERVICE } from "@/app/services/report-service/report-service";
import { unwrapArray } from "@/app/services/response-utils";

interface Props {
  openModalId: ModalId | null;
  onCloseModal: (id: ModalId) => void;
  onNav: (id: PageId) => void;
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

export default function Modals({ openModalId, onCloseModal, onNav }: Props) {
  const [values, setValues] = useState<Record<string, string>>({
    type: "",
    from: "",
    to: "",
    quantity: "",
    tnmStage: "",
    insurer: "",
    icd10: "",
    description: "",
  });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [pharmacyPage, setPharmacyPage] = useState(1);
  const [morePharmacies, setMorePharmacies] = useState(false);
  const [loadingPrescriptionOptions, setLoadingPrescriptionOptions] =
    useState(false);
  const [prescriptionOptionsMessage, setPrescriptionOptionsMessage] =
    useState("");
  const { userData } = useProvider();
  const isDoctor = userData.user?.account_type === "DOCTOR";
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
    if (openModalId === "modal-prescription") {
      setPharmacyPage(1);
      setMorePharmacies(false);
    }
  }, [openModalId]);

  useEffect(() => {
    if (openModalId !== "modal-prescription" || !isDoctor) return;
    let current = true;
    setLoadingPrescriptionOptions(true);
    setMedicines([]);
    if (pharmacyPage === 1) setPharmacies([]);
    setPrescriptionOptionsMessage("");
    void Promise.all([
      MEDICINE_SERVICE.list(),
      PRESCRIPTION_SERVICE.pharmacies(pharmacyPage),
    ])
      .then(([medicineResponse, networkResponse]) => {
        if (!current) return;
        if (medicineResponse.success)
          setMedicines(
            unwrapArray(medicineResponse.data).filter(
              (medicine) => !medicineUnavailable(medicine),
            ),
          );
        else
          setPrescriptionOptionsMessage(
            medicineResponse.message || "Medicine catalog could not be loaded.",
          );
        if (networkResponse.success) {
          const directory = networkResponse.data;
          if (
            !Array.isArray(directory?.items) ||
            !directory.pagination ||
            typeof directory.pagination.total !== "number"
          ) {
            setPrescriptionOptionsMessage(
              "The pharmacy directory returned an invalid response.",
            );
            return;
          }
          const activePharmacies = directory.items.filter(
            (facility: any) =>
              facility &&
              typeof facility === "object" &&
              typeof facility.id === "string" &&
              typeof facility.name === "string" &&
              facility.status === "ACTIVE" &&
              facility.verified === true,
          );
          setPharmacies((current) =>
            pharmacyPage === 1
              ? activePharmacies
              : [
                  ...new Map(
                    [...current, ...activePharmacies].map((facility) => [
                      facility.id,
                      facility,
                    ]),
                  ).values(),
                ],
          );
          setMorePharmacies(
            directory.items.length > 0 &&
              pharmacyPage * directory.pagination.limit <
                directory.pagination.total,
          );
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
  }, [openModalId, isDoctor, pharmacyPage]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    if (openModalId === "modal-prescription") {
      if (!isDoctor) {
        setMessage("Only a signed-in doctor can create a prescription.");
        return;
      }
      if ((values.description ?? "").length > 2000) {
        setMessage("Keep the description to 2,000 characters or fewer.");
        return;
      }
      if (
        !values.icd10?.trim() ||
        values.icd10.trim().toUpperCase().length > 200
      ) {
        setMessage("Enter a diagnosis code of no more than 200 characters.");
        return;
      }
      const quantity = Number(values.quantity);
      if (
        !Number.isSafeInteger(quantity) ||
        quantity <= 0 ||
        !values.insurer?.trim()
      ) {
        setMessage(
          "Choose a payment option and enter a positive whole quantity.",
        );
        return;
      }
    }
    if (
      openModalId === "modal-prescription" &&
      (loadingPrescriptionOptions ||
        !medicines.some((medicine) => medicine.id === values.drugId) ||
        !pharmacies.some(
          (pharmacy) => pharmacy.id === values.pharmacyFacilityId,
        ))
    ) {
      setMessage(
        "Select a medicine and an available pharmacy from the loaded options.",
      );
      return;
    }
    setBusy(true);
    setMessage("");
    let response;
    if (openModalId === "modal-export")
      response = await REPORT_SERVICE.export({
        type: values.type,
        from: values.from,
        to: values.to,
      });
    else if (openModalId === "modal-breach")
      response = await INVENTORY_SERVICE.dispose(values.inventoryItemId);
    else if (openModalId === "modal-prescription")
      response = await PRESCRIPTION_SERVICE.create({
        patient_ref: values.patientRef,
        description: values.description ?? "",
        icd10: values.icd10,
        ...(values.tnmStage?.trim()
          ? { tnm_stage: values.tnmStage.trim() }
          : {}),
        insurer: values.insurer,
        drug_id: values.drugId,
        qty: Number(values.quantity),
        pharmacy_facility_id: values.pharmacyFacilityId,
      });
    if (response && openModalId === "modal-export" && response.success) {
      try {
        const { blob, filename } = reportDownload(response.data);
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      } catch (failure) {
        const message =
          failure instanceof Error
            ? failure.message
            : "Report download failed.";
        setMessage(message);
        toast.error(message);
        setBusy(false);
        return;
      }
    }
    if (response) {
      if (response.success)
        toast.success(
          response.message ||
            (openModalId === "modal-prescription"
              ? "Prescription created."
              : openModalId === "modal-transfer"
                ? "Transfer request submitted."
                : openModalId === "modal-export"
                  ? "Report prepared."
                  : "Inventory action completed."),
        );
      else
        toast.error(response.message || "The request could not be completed.");
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
        description: "",
        icd10: "",
        tnmStage: "",
        insurer: "",
        drugId: "",
        quantity: "",
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
    helpText?: string,
  ) => (
    <label className="mb-3 block text-xs font-semibold text-g600" key={key}>
      {label}
      <input
        className="mt-1 w-full rounded-lg border border-g200 px-3 py-2.5 text-sm font-normal"
        type={type}
        value={values[key] ?? ""}
        onChange={set(key)}
        maxLength={key === "icd10" ? 200 : undefined}
        min={type === "number" ? 1 : undefined}
        step={type === "number" ? 1 : undefined}
        placeholder={placeholder}
        aria-describedby={helpText ? `prescription-${key}-help` : undefined}
        required={key !== "tnmStage"}
      />
      {helpText && (
        <span
          id={`prescription-${key}-help`}
          className="mt-1.5 block text-xs font-normal leading-5 text-g500"
        >
          {helpText}
        </span>
      )}
    </label>
  );
  const isForm =
    ["modal-export", "modal-breach", "modal-prescription"].includes(
      openModalId,
    ) &&
    (openModalId !== "modal-prescription" || isDoctor);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 p-4"
      onClick={() => onCloseModal(openModalId)}
    >
      <section
        className="portal-dialog max-h-[90vh] w-full max-w-[520px] overflow-y-auto rounded-2xl bg-w shadow-2xl"
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
                          if (!response.success)
                            toast.error(
                              response.message ||
                                "Notification could not be marked as read.",
                            );
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
              Invite a colleague from Facility team. Select their account type
              and facility, then send the invitation.
            </p>
            <button
              type="button"
              className="mt-4 rounded-lg bg-p px-4 py-2 text-sm text-white"
              onClick={() => {
                onCloseModal("modal-user");
                onNav("pg-users");
              }}
            >
              Open facility team
            </button>
          </div>
        ) : null}
        {openModalId === "modal-transfer" && (
          <TransferRequestForm onClose={() => onCloseModal("modal-transfer")} />
        )}
        {openModalId === "modal-prescription" && !isDoctor && (
          <p className="p-6 text-sm text-g600">
            Only a signed-in doctor can create a prescription. You can still
            view dispensing records available to your account.
          </p>
        )}
        {isForm ? (
          <form className="p-6" onSubmit={(event) => void submit(event)}>
            {openModalId === "modal-export" ? (
              <>
                <ApiOptionSelect
                  context="reports"
                  field="reportFormats"
                  label="Report type"
                  value={values.type}
                  required
                  onChange={(value) =>
                    setValues((current) => ({ ...current, type: value }))
                  }
                />
                {field("from", "From date", "", "date")}
                {field("to", "To date", "", "date")}
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
                <p className="mb-5 text-sm leading-6 text-g500">
                  Enter the patient code and clinical details from the care
                  record, then choose the medicine and dispensing pharmacy. All
                  fields are required except cancer stage and description.
                </p>
                <h3 className="mb-3 text-sm font-semibold text-g800">
                  Patient &amp; diagnosis
                </h3>
                {field(
                  "patientRef",
                  "Patient reference code",
                  "Enter your facility's patient code",
                  "text",
                  "Use a coded reference your care team can recognize. Do not enter the patient's name, phone number or email.",
                )}
                {field(
                  "icd10",
                  "Diagnosis code (ICD-10)",
                  "Enter the recorded diagnosis code",
                  "text",
                  "Copy the ICD-10 value from the clinician's diagnosis (up to 200 characters). Codes for cancer and other conditions are accepted.",
                )}
                {field(
                  "tnmStage",
                  "Cancer stage (TNM, optional)",
                  "Enter the recorded TNM stage",
                  "text",
                  "If applicable, use the TNM stage documented by the treating clinician. Leave blank when it does not apply or is not recorded.",
                )}
                <PrescriptionDescriptionField
                  value={values.description ?? ""}
                  disabled={busy}
                  onChange={(description) =>
                    setValues((current) => ({ ...current, description }))
                  }
                />
                <h3 className="mb-3 mt-5 text-sm font-semibold text-g800">
                  Payment &amp; dispensing
                </h3>
                <ApiOptionSelect
                  context="prescription"
                  field="insurers"
                  label="How will this prescription be paid for?"
                  emptyLabel="Choose an insurer or payment method"
                  helpText="Select an insurer if listed, or choose card, bank transfer or USSD for direct payment. USSD uses your bank's short-code menu on a phone. Selecting an option does not take payment."
                  value={values.insurer}
                  required
                  onChange={(value) =>
                    setValues((current) => ({ ...current, insurer: value }))
                  }
                />
                <label className="mb-3 block text-xs font-semibold text-g600">
                  Medicine to prescribe
                  <select
                    className="mt-1 w-full rounded-lg border border-g200 bg-w px-3 py-2.5 text-sm font-normal"
                    value={values.drugId ?? ""}
                    aria-describedby="prescription-medicine-help"
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
                        {medicine.brand_name || medicine.brand
                          ? ` (${medicine.brand_name ?? medicine.brand})`
                          : ""}
                      </option>
                    ))}
                  </select>
                  <span
                    id="prescription-medicine-help"
                    className="mt-1.5 block text-xs font-normal leading-5 text-g500"
                  >
                    Check the medicine name, strength and brand before
                    selecting.
                  </span>
                </label>
                {field(
                  "quantity",
                  "Quantity to dispense",
                  "Enter number of units",
                  "number",
                  "Enter a whole number of units in the medicine's dispensing unit, rather than a dose in milligrams.",
                )}
                <label className="mb-3 block text-xs font-semibold text-g600">
                  Dispensing pharmacy
                  <select
                    className="mt-1 w-full rounded-lg border border-g200 bg-w px-3 py-2.5 text-sm font-normal"
                    value={values.pharmacyFacilityId ?? ""}
                    aria-describedby="prescription-pharmacy-help"
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
                  <span
                    id="prescription-pharmacy-help"
                    className="mt-1.5 block text-xs font-normal leading-5 text-g500"
                  >
                    Choose the verified pharmacy that should receive this
                    prescription.
                  </span>
                </label>
                <p className="mb-3 text-xs leading-5 text-g500">
                  {morePharmacies && (
                    <button
                      type="button"
                      className="mb-3 block text-p underline"
                      disabled={loadingPrescriptionOptions}
                      onClick={() => setPharmacyPage((page) => page + 1)}
                    >
                      Load more pharmacies
                    </button>
                  )}
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
