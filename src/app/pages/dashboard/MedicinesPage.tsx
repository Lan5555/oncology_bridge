"use client";

import { type FormEvent, useEffect, useState } from "react";
import { MEDICINE_SERVICE } from "@/app/services/medicine-service/medicine-service";
import { unwrapArray } from "@/app/services/response-utils";
import EmptyState from "@/app/components/EmptyState";
import { Pill } from "lucide-react";

type Medicine = {
  id: string;
  generic_name?: string;
  brand?: string;
  strength?: string;
  gtin?: string;
};

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [genericName, setGenericName] = useState("");
  const [brand, setBrand] = useState("");
  const [strength, setStrength] = useState("");
  const [gtin, setGtin] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const response = await MEDICINE_SERVICE.list();
    if (response.success) setMedicines(unwrapArray(response.data));
    else setNotice(response.message || "Medicine catalog could not be loaded.");
  };

  useEffect(() => {
    void load();
  }, []);

  const createMedicine = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!genericName.trim()) return;
    setBusy(true);
    const response = await MEDICINE_SERVICE.create({
      generic_name: genericName.trim(),
      brand: brand.trim() || undefined,
      strength: strength.trim() || undefined,
      gtin: gtin.trim() || undefined,
    });
    setNotice(
      response.message ||
        (response.success
          ? "Medicine created."
          : "Medicine could not be created."),
    );
    if (response.success) {
      setGenericName("");
      setBrand("");
      setStrength("");
      setGtin("");
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
        onSubmit={createMedicine}
        className="mb-6 grid gap-3 rounded-xl border border-g200 bg-w p-5 md:grid-cols-2"
      >
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-g900 md:col-span-2">
          <Pill className="size-4 text-p" aria-hidden="true" />
          Add a medicine
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
          Brand
          <input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
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
          {busy ? "Saving…" : "Create medicine"}
        </button>
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
                <div>
                  <p className="text-sm font-semibold text-g800">
                    {medicine.generic_name ?? "Unnamed medicine"}
                    {medicine.brand ? ` · ${medicine.brand}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-g500">
                    {medicine.strength ?? "Strength not specified"}
                    {medicine.gtin ? ` · GTIN ${medicine.gtin}` : ""}
                  </p>
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
    </div>
  );
}
