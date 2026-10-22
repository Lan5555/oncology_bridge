"use client";

import { Edit2, Pill, Trash2, X } from "lucide-react";

import { type FormEvent, useEffect, useState } from "react";
import EmptyState from "@/app/components/EmptyState";
import { medicineUnavailable } from "@/app/lib/medicine-availability";
import { notifyResult } from "@/app/lib/notifications";
import { MEDICINE_SERVICE } from "@/app/services/medicine-service/medicine-service";
import { unwrapArray } from "@/app/services/response-utils";

type Medicine = {
  id: string;
  generic_name?: string;
  brand?: string;
  brand_name?: string;
  manufacturer?: string;
  dosage_form?: string;
  storage_temperature?: string;
  strength?: string;
  gtin?: string;
};

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [genericName, setGenericName] = useState("");
  const [brand, setBrand] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [dosageForm, setDosageForm] = useState("");
  const [storageTemperature, setStorageTemperature] = useState("");
  const [strength, setStrength] = useState("");
  const [gtin, setGtin] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [editTarget, setEditTarget] = useState<Medicine | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Medicine | null>(null);

  const resetForm = () => {
    setGenericName("");
    setBrand("");
    setManufacturer("");
    setDosageForm("");
    setStorageTemperature("");
    setStrength("");
    setGtin("");
  };

  const requiredFields = {
    generic_name: genericName.trim(),
    brand_name: brand.trim(),
    manufacturer: manufacturer.trim(),
    dosage_form: dosageForm.trim(),
    storage_temperature: storageTemperature.trim(),
  };
  const validateForm = () => {
    if (Object.values(requiredFields).some((value) => !value)) {
      setNotice(
        "Enter a generic name, brand name, manufacturer, dosage form, and storage temperature.",
      );
      return false;
    }
    return true;
  };

  const load = async () => {
    const response = await MEDICINE_SERVICE.list();
    if (response.success)
      setMedicines(
        unwrapArray(response.data).filter(
          (medicine) => !medicineUnavailable(medicine),
        ),
      );
    else setNotice(response.message || "Medicine catalog could not be loaded.");
  };

  useEffect(() => {
    void load();
  }, []);

  const createMedicine = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || !validateForm()) return;
    setBusy(true);
    const response = await MEDICINE_SERVICE.create({
      ...requiredFields,
      strength: strength.trim() || undefined,
      gtin: gtin.trim() || undefined,
    });
    notifyResult(
      response,
      "Medicine created.",
      "Medicine could not be created.",
    );
    setNotice(
      response.message ||
        (response.success
          ? "Medicine created."
          : "Medicine could not be created."),
    );
    if (response.success) {
      resetForm();
      await load();
    }
    setBusy(false);
  };

  const updateMedicine = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editTarget || busy || !validateForm()) return;
    setBusy(true);
    const response = await MEDICINE_SERVICE.update(editTarget.id, {
      ...requiredFields,
      strength: strength.trim() || null,
      gtin: gtin.trim() || null,
    });
    notifyResult(
      response,
      "Medicine updated.",
      "Medicine could not be updated.",
    );
    setNotice(
      response.message ||
        (response.success
          ? "Medicine updated."
          : "Medicine could not be updated."),
    );
    if (response.success) {
      setEditTarget(null);
      resetForm();
      await load();
    }
    setBusy(false);
  };

  const startEdit = (medicine: Medicine) => {
    setEditTarget(medicine);
    setGenericName(medicine.generic_name ?? "");
    setBrand(medicine.brand_name ?? medicine.brand ?? "");
    setManufacturer(medicine.manufacturer ?? "");
    setDosageForm(medicine.dosage_form ?? "");
    setStorageTemperature(medicine.storage_temperature ?? "");
    setStrength(medicine.strength ?? "");
    setGtin(medicine.gtin ?? "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteMedicine = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    const response = await MEDICINE_SERVICE.remove(deleteTarget.id);
    notifyResult(
      response,
      "Medicine removed.",
      "Medicine could not be removed.",
    );
    setNotice(
      response.message ||
        (response.success
          ? "Medicine removed from the catalog."
          : "Medicine could not be removed."),
    );
    if (response.success) {
      setDeleteTarget(null);
      await load();
    }
    setBusy(false);
  };

  return (
    <div className="block animate-fade-up">
      <header className="mb-6 rounded-2xl border border-g200 bg-linear-to-br from-w via-w to-pll p-5 shadow-sm">
        <h1 className="flex items-center gap-2 text-xl font-bold text-g900">
          <Pill className="size-5 text-p" aria-hidden="true" />
          Medicine Catalog
        </h1>
        <p className="mt-1 text-[12.5px] text-g500">
          Manage medicine identifiers used by inventory and GS1 verification.
        </p>
      </header>
      {notice ? (
        <p role="status" className="mb-4 text-sm text-g600">
          {notice}
        </p>
      ) : null}
      <form
        onSubmit={editTarget ? updateMedicine : createMedicine}
        className="mb-6 grid gap-3 rounded-xl border border-g200 bg-w p-5 md:grid-cols-2"
      >
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-g900 md:col-span-2">
          <Pill className="size-4 text-p" aria-hidden="true" />
          {editTarget ? "Edit medicine" : "Add a medicine"}
        </h2>
        <label className="grid gap-1 text-xs font-semibold text-g600">
          Generic name
          <input
            required
            value={genericName}
            onChange={(e) => setGenericName(e.target.value)}
            className="rounded-lg border border-g200 bg-w px-3 py-2 text-sm text-g900"
          />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-g600">
          Brand name
          <input
            required
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="rounded-lg border border-g200 bg-w px-3 py-2 text-sm text-g900"
          />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-g600">
          Manufacturer
          <input
            required
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
            className="rounded-lg border border-g200 bg-w px-3 py-2 text-sm text-g900"
          />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-g600">
          Dosage form
          <input
            required
            value={dosageForm}
            placeholder="Enter dosage form"
            onChange={(e) => setDosageForm(e.target.value)}
            className="rounded-lg border border-g200 bg-w px-3 py-2 text-sm text-g900"
          />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-g600">
          Storage temperature
          <input
            required
            value={storageTemperature}
            placeholder="Enter conditions from the product label"
            onChange={(e) => setStorageTemperature(e.target.value)}
            className="rounded-lg border border-g200 bg-w px-3 py-2 text-sm text-g900"
          />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-g600">
          Strength
          <input
            value={strength}
            onChange={(e) => setStrength(e.target.value)}
            className="rounded-lg border border-g200 bg-w px-3 py-2 text-sm text-g900"
          />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-g600">
          GTIN
          <input
            value={gtin}
            onChange={(e) => setGtin(e.target.value)}
            inputMode="numeric"
            className="rounded-lg border border-g200 bg-w px-3 py-2 text-sm text-g900"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="w-fit rounded-lg bg-p px-4 py-2 text-sm font-semibold text-w disabled:opacity-60"
        >
          {busy ? "Saving…" : editTarget ? "Save changes" : "Create medicine"}
        </button>
        {editTarget ? (
          <button
            type="button"
            onClick={() => {
              setEditTarget(null);
              resetForm();
            }}
            className="w-fit rounded-lg border border-g200 px-4 py-2 text-sm font-semibold text-g600"
          >
            Cancel edit
          </button>
        ) : null}
      </form>
      <section className="rounded-xl border border-g200 bg-w p-5">
        <h2 className="mb-3 flex items-center gap-2 text-[15px] font-bold text-g900">
          <Pill className="size-4 text-p" aria-hidden="true" />
          Catalog
        </h2>
        {medicines.length ? (
          <div className="divide-y divide-g100">
            {medicines.map((medicine) => (
              <article
                key={medicine.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-g800">
                    {medicine.generic_name ?? "Unnamed medicine"}
                    {medicine.brand_name || medicine.brand
                      ? ` · ${medicine.brand_name ?? medicine.brand}`
                      : ""}
                  </p>
                  <p className="mt-1 text-xs text-g500">
                    {medicine.strength ?? "Strength not specified"}
                    {medicine.gtin ? ` · GTIN ${medicine.gtin}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    aria-label={`Edit ${medicine.generic_name ?? "medicine"}`}
                    onClick={() => startEdit(medicine)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-g200 px-3 py-2 text-xs font-semibold text-g700 hover:bg-g50"
                  >
                    <Edit2 className="size-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${medicine.generic_name ?? "medicine"}`}
                    onClick={() => setDeleteTarget(medicine)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="size-3.5" /> Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Pill}
            title="Your catalog is ready to grow"
            description="Add a medicine above to connect its identifiers with GS1 scans and inventory."
          />
        )}
      </section>
      {deleteTarget ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busy)
              setDeleteTarget(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-medicine-title"
            className="w-full max-w-md rounded-2xl border border-g200 bg-w p-5 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="delete-medicine-title"
                  className="text-lg font-bold text-g900"
                >
                  Remove medicine?
                </h2>
                <p className="mt-2 text-sm text-g600">
                  {deleteTarget.generic_name}
                  {deleteTarget.brand_name || deleteTarget.brand
                    ? ` · ${deleteTarget.brand_name ?? deleteTarget.brand}`
                    : ""}{" "}
                  will be removed from the catalog. Existing records may remain
                  in historical transactions.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                disabled={busy}
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg p-1.5 text-g500 hover:bg-g50"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-g200 px-4 py-2 text-sm font-semibold text-g700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void deleteMedicine()}
                className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {busy ? "Removing…" : "Remove medicine"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
