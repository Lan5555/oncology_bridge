"use client";

import {
  ArrowDownAZ,
  Barcode,
  Building2,
  Check,
  ChevronRight,
  Edit2,
  FlaskConical,
  Info,
  Loader2,
  type LucideIcon,
  Package,
  Pill,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Thermometer,
  Trash2,
  X,
} from "lucide-react";
import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import BulkMedicineEditor from "@/app/components/BulkMedicineEditor";
import EmptyState from "@/app/components/EmptyState";
import { medicineUnavailable } from "@/app/lib/medicine-availability";
import { notifyResult } from "@/app/lib/notifications";
import { MEDICINE_SERVICE } from "@/app/services/medicine-service/medicine-service";
import { unwrapArray } from "@/app/services/response-utils";
import styles from "./MedicinesPage.module.css";

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
  const [formError, setFormError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Medicine | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Medicine | null>(null);
  const [query, setQuery] = useState("");
  const [formFilter, setFormFilter] = useState("");
  const [identifierFilter, setIdentifierFilter] = useState("");
  const [sort, setSort] = useState("name");
  const requestId = useRef(0);

  const resetForm = () => {
    setGenericName("");
    setBrand("");
    setManufacturer("");
    setDosageForm("");
    setStorageTemperature("");
    setStrength("");
    setGtin("");
    setFormError("");
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
      setFormError(
        "Enter a generic name, brand name, manufacturer, dosage form, and storage temperature.",
      );
      return false;
    }
    return true;
  };
  const load = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setLoadError("");
    const response = await MEDICINE_SERVICE.list();
    if (currentRequest !== requestId.current) return;
    if (response.success)
      setMedicines(
        unwrapArray(response.data).filter(
          (medicine) => !medicineUnavailable(medicine),
        ),
      );
    else
      setLoadError(response.message || "Medicine catalog could not be loaded.");
    setLoading(false);
  }, []);
  useEffect(() => {
    void load();
    return () => {
      requestId.current += 1;
    };
  }, [load]);

  const createMedicine = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || !validateForm()) return;
    setBusy(true);
    setFormError("");
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
    if (response.success) {
      setNotice(response.message || "Medicine created.");
      resetForm();
      setEditorOpen(false);
      await load();
    } else
      setFormError(
        response.message ||
          "Medicine could not be created. Your details have been kept.",
      );
    setBusy(false);
  };
  const updateMedicine = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editTarget || busy || !validateForm()) return;
    setBusy(true);
    setFormError("");
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
    if (response.success) {
      setNotice(response.message || "Medicine updated.");
      setEditTarget(null);
      resetForm();
      setEditorOpen(false);
      await load();
    } else
      setFormError(
        response.message ||
          "Medicine could not be updated. Your details have been kept.",
      );
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
    setFormError("");
    setEditorOpen(true);
  };
  const startCreate = () => {
    if (editTarget) resetForm();
    setEditTarget(null);
    setEditorOpen(true);
  };
  const deleteMedicine = async () => {
    if (!deleteTarget || busy) return;
    setBusy(true);
    setFormError("");
    const response = await MEDICINE_SERVICE.remove(deleteTarget.id);
    notifyResult(
      response,
      "Medicine removed.",
      "Medicine could not be removed.",
    );
    if (response.success) {
      setNotice(response.message || "Medicine removed from the catalog.");
      setDeleteTarget(null);
      await load();
    } else setFormError(response.message || "Medicine could not be removed.");
    setBusy(false);
  };

  const dosageForms = [
    ...new Set(
      medicines
        .map((medicine) => medicine.dosage_form?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  ].sort((a, b) => a.localeCompare(b));
  const search = query.trim().toLocaleLowerCase();
  const filtered = medicines
    .filter((medicine) => {
      const matchesSearch =
        !search ||
        [
          medicine.generic_name,
          medicine.brand_name,
          medicine.brand,
          medicine.manufacturer,
          medicine.dosage_form,
          medicine.strength,
          medicine.gtin,
        ].some((value) => value?.toLocaleLowerCase().includes(search));
      return (
        matchesSearch &&
        (!formFilter || medicine.dosage_form?.trim() === formFilter) &&
        (!identifierFilter ||
          (identifierFilter === "recorded"
            ? Boolean(medicine.gtin?.trim())
            : !medicine.gtin?.trim()))
      );
    })
    .sort((a, b) =>
      sort === "manufacturer"
        ? (a.manufacturer ?? "").localeCompare(b.manufacturer ?? "") ||
          (a.generic_name ?? "").localeCompare(b.generic_name ?? "")
        : (a.generic_name ?? "").localeCompare(b.generic_name ?? "") ||
          (a.brand_name ?? a.brand ?? "").localeCompare(
            b.brand_name ?? b.brand ?? "",
          ),
    );
  const hasFilters = Boolean(query || formFilter || identifierFilter);
  const clearFilters = () => {
    setQuery("");
    setFormFilter("");
    setIdentifierFilter("");
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <div className={styles.eyebrow}>
            <span>Pharmacy workspace</span>
            <ChevronRight size={12} />
            <span>Medicine catalog</span>
          </div>
          <div className={styles.titleLine}>
            <span className={styles.titleIcon}>
              <Pill size={23} strokeWidth={1.6} />
            </span>
            <h1>Medicine catalog</h1>
          </div>
          <p className={styles.subtitle}>
            A clear reference for the medicines behind your inventory.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => setBulkOpen(true)}
            disabled={busy}
          >
            <Plus size={17} />
            Bulk add medicines
          </button>
          <button
            type="button"
            className={styles.primary}
            onClick={startCreate}
            disabled={busy}
          >
            <Plus size={17} />
            Add medicine
          </button>
        </div>
      </header>

      <aside className={styles.context} aria-label="About the medicine catalog">
        <span className={styles.contextIcon}>
          <Barcode size={21} strokeWidth={1.6} />
        </span>
        <div>
          <strong>Consistent records. Traceable inventory.</strong>
          <p>
            Maintain medicine identities, product identifiers, and storage
            requirements in one place.
          </p>
        </div>
        <span className={styles.contextTag}>
          <Package size={14} />
          Inventory reference
        </span>
      </aside>

      {notice && (
        <output className={styles.notice}>
          <Check size={16} />
          <span>{notice}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <X size={15} />
          </button>
        </output>
      )}

      <BulkMedicineEditor
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onCreated={(count) => {
          setNotice(
            `${count} ${count === 1 ? "medicine created" : "medicines created"}.`,
          );
          setBulkOpen(false);
          void load();
        }}
      />

      <section
        className={styles.catalog}
        aria-labelledby="catalog-heading"
        aria-busy={loading}
      >
        <div className={styles.sectionHeading}>
          <div className={styles.sectionTitle}>
            <h2 id="catalog-heading">Medicine directory</h2>
            <span className={styles.count}>
              {loading ? "Loading…" : `${medicines.length} loaded`}
            </span>
          </div>
          <button
            type="button"
            className={styles.refresh}
            onClick={() => void load()}
            disabled={loading || busy}
          >
            <RefreshCw
              size={14}
              className={loading ? styles.spin : undefined}
            />
            Refresh
          </button>
        </div>
        <div className={styles.toolbar}>
          <label className={styles.search}>
            <Search size={17} aria-hidden="true" />
            <span className={styles.srOnly}>Search loaded medicines</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, brand, manufacturer or GTIN"
            />
          </label>
          <div className={styles.filters}>
            <SlidersHorizontal
              size={15}
              aria-hidden="true"
              className={styles.filterIcon}
            />
            <label>
              <span className={styles.srOnly}>Filter by dosage form</span>
              <select
                value={formFilter}
                onChange={(event) => setFormFilter(event.target.value)}
              >
                <option value="">All dosage forms</option>
                {dosageForms.map((form) => (
                  <option key={form} value={form}>
                    {form}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className={styles.srOnly}>Filter by GTIN availability</span>
              <select
                value={identifierFilter}
                onChange={(event) => setIdentifierFilter(event.target.value)}
              >
                <option value="">All identifiers</option>
                <option value="recorded">GTIN recorded</option>
                <option value="missing">GTIN not recorded</option>
              </select>
            </label>
          </div>
        </div>
        <div className={styles.resultsBar}>
          <p aria-live="polite">
            {loading ? (
              "Retrieving your medicine records…"
            ) : loadError ? (
              "Catalog refresh unavailable"
            ) : (
              <>
                <strong>{filtered.length}</strong>{" "}
                {filtered.length === 1 ? "medicine" : "medicines"}
                {hasFilters
                  ? " matching your filters"
                  : " in the loaded catalog"}
              </>
            )}
            {hasFilters && (
              <button
                type="button"
                className={styles.clear}
                onClick={clearFilters}
              >
                Clear filters
                <X size={12} />
              </button>
            )}
          </p>
          <label className={styles.sort}>
            <ArrowDownAZ size={15} />
            <span className={styles.srOnly}>Sort medicines</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="name">Medicine name</option>
              <option value="manufacturer">Manufacturer</option>
            </select>
          </label>
        </div>
        {loadError && (
          <div className={styles.error} role="alert">
            <Info size={17} />
            <div>
              <strong>We couldn’t refresh the catalog.</strong>
              <p>
                {loadError}
                {medicines.length
                  ? " Previously loaded records are shown below."
                  : ""}
              </p>
            </div>
            <button
              type="button"
              className={styles.secondary}
              disabled={loading}
              onClick={() => void load()}
            >
              Try again
            </button>
          </div>
        )}
        {loading ? (
          <div className={styles.loading}>
            <Loader2 size={23} className={styles.spin} />
            <output>Loading medicine records…</output>
          </div>
        ) : filtered.length ? (
          <>
            <div className={styles.columnHead} aria-hidden="true">
              <span>Medicine / brand</span>
              <span>Manufacturer</span>
              <span>Form / strength</span>
              <span>Storage &amp; identifier</span>
              <span>Actions</span>
            </div>
            <div>
              {filtered.map((medicine) => (
                <article
                  key={medicine.id}
                  className={styles.record}
                  aria-label={medicine.generic_name || "Unnamed medicine"}
                >
                  <div className={styles.identity}>
                    <span className={styles.medicineIcon}>
                      <Pill size={20} strokeWidth={1.5} />
                    </span>
                    <div>
                      <h3>{medicine.generic_name || "Unnamed medicine"}</h3>
                      <p>
                        {medicine.brand_name ||
                          medicine.brand ||
                          "Brand not recorded"}
                      </p>
                    </div>
                  </div>
                  <dl className={styles.detail}>
                    <dt>Manufacturer</dt>
                    <dd>
                      <Building2 size={13} aria-hidden="true" />
                      {medicine.manufacturer || "Not recorded"}
                    </dd>
                  </dl>
                  <dl className={styles.detail}>
                    <dt>Form / strength</dt>
                    <dd>
                      <span className={styles.formTag}>
                        {medicine.dosage_form || "Form not recorded"}
                      </span>
                    </dd>
                    <dd className={styles.muted}>
                      {medicine.strength || "Strength not recorded"}
                    </dd>
                  </dl>
                  <dl className={`${styles.detail} ${styles.storage}`}>
                    <dt>Storage &amp; identifier</dt>
                    <dd>
                      <Thermometer size={14} aria-hidden="true" />
                      {medicine.storage_temperature || "Storage not recorded"}
                    </dd>
                    <dd className={styles.gtin}>
                      <Barcode size={14} aria-hidden="true" />
                      <span>
                        {medicine.gtin
                          ? `GTIN ${medicine.gtin}`
                          : "GTIN not recorded"}
                      </span>
                    </dd>
                  </dl>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      aria-label={`Edit ${medicine.generic_name || "medicine"}`}
                      title="Edit medicine"
                      onClick={() => startEdit(medicine)}
                      disabled={busy}
                    >
                      <Edit2 size={15} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${medicine.generic_name || "medicine"}`}
                      title="Remove medicine"
                      className={styles.deleteAction}
                      disabled={busy}
                      onClick={() => {
                        setFormError("");
                        setDeleteTarget(medicine);
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <footer className={styles.catalogFooter}>
              <span>
                Showing {filtered.length} of {medicines.length} loaded records
              </span>
              <span>
                <Info size={13} />
                Search and filters apply to loaded records.
              </span>
            </footer>
          </>
        ) : (
          !loadError && (
            <div className={styles.empty}>
              <EmptyState
                icon={hasFilters ? Search : Pill}
                title={
                  hasFilters
                    ? "No medicines match your filters"
                    : "Build your medicine catalog"
                }
                description={
                  hasFilters
                    ? "Try another medicine name, brand or GTIN, or clear the filters to see all loaded records."
                    : "Add your first medicine to record its product details and connect it with inventory."
                }
                action={
                  <button
                    type="button"
                    className={styles.primary}
                    onClick={hasFilters ? clearFilters : startCreate}
                  >
                    {hasFilters ? (
                      <>
                        <X size={15} />
                        Clear filters
                      </>
                    ) : (
                      <>
                        <Plus size={15} />
                        Add medicine
                      </>
                    )}
                  </button>
                }
              />
            </div>
          )
        )}
      </section>

      <CatalogDialog
        open={editorOpen}
        busy={busy}
        onClose={() => setEditorOpen(false)}
        labelledBy="medicine-editor-title"
      >
        <div className={styles.dialogHeader}>
          <span className={styles.titleIcon}>
            {editTarget ? <Edit2 size={21} /> : <Pill size={23} />}
          </span>
          <div>
            <p className={styles.dialogEyebrow}>Medicine catalog</p>
            <h2 id="medicine-editor-title">
              {editTarget ? "Edit medicine" : "Add a medicine"}
            </h2>
          </div>
          <button
            type="button"
            className={styles.close}
            aria-label="Close medicine editor"
            disabled={busy}
            onClick={() => setEditorOpen(false)}
          >
            <X size={19} />
          </button>
        </div>
        <form
          onSubmit={editTarget ? updateMedicine : createMedicine}
          className={styles.editor}
        >
          <p className={styles.formIntro}>
            Use the product label to keep medicine details accurate. Required
            fields are marked <span aria-hidden="true">*</span>.
          </p>
          <fieldset disabled={busy} className={styles.fieldset}>
            <legend>
              <span>01</span>Medicine identity
            </legend>
            <div className={styles.fieldGrid}>
              <CatalogField
                label="Generic name"
                icon={Pill}
                required
                value={genericName}
                onChange={setGenericName}
                placeholder="Enter generic name"
              />
              <CatalogField
                label="Brand name"
                icon={Package}
                required
                value={brand}
                onChange={setBrand}
                placeholder="Enter brand name"
              />
              <CatalogField
                label="Manufacturer"
                icon={Building2}
                required
                value={manufacturer}
                onChange={setManufacturer}
                placeholder="Enter manufacturer"
                full
              />
            </div>
          </fieldset>
          <fieldset disabled={busy} className={styles.fieldset}>
            <legend>
              <span>02</span>Product details
            </legend>
            <div className={styles.fieldGrid}>
              <CatalogField
                label="Dosage form"
                icon={FlaskConical}
                required
                value={dosageForm}
                onChange={setDosageForm}
                placeholder="Enter dosage form"
              />
              <CatalogField
                label="Strength"
                icon={Pill}
                value={strength}
                onChange={setStrength}
                placeholder="Enter labelled strength"
              />
              <CatalogField
                label="Storage temperature"
                icon={Thermometer}
                required
                value={storageTemperature}
                onChange={setStorageTemperature}
                placeholder="Enter conditions from the product label"
                hint="Record the exact storage requirements on the product label."
                full
              />
              <CatalogField
                label="GTIN"
                icon={Barcode}
                value={gtin}
                onChange={setGtin}
                placeholder="Enter product GTIN"
                hint="Use the Global Trade Item Number printed on the product packaging."
                numeric
                full
              />
            </div>
          </fieldset>
          {formError && (
            <p role="alert" className={styles.formError}>
              <Info size={16} />
              {formError}
            </p>
          )}
          <div className={styles.formFooter}>
            <span>
              <Info size={14} />
              Details are used by inventory and GS1 lookup.
            </span>
            <div>
              <button
                type="button"
                className={styles.secondary}
                disabled={busy}
                onClick={() => setEditorOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className={styles.primary} disabled={busy}>
                {busy ? (
                  <Loader2 size={16} className={styles.spin} />
                ) : (
                  <Check size={16} />
                )}
                {busy
                  ? "Saving…"
                  : editTarget
                    ? "Save changes"
                    : "Create medicine"}
              </button>
            </div>
          </div>
        </form>
      </CatalogDialog>

      <CatalogDialog
        open={Boolean(deleteTarget)}
        busy={busy}
        onClose={() => setDeleteTarget(null)}
        labelledBy="delete-medicine-title"
        compact
      >
        <div className={styles.dialogHeader}>
          <span className={styles.dangerIcon}>
            <Trash2 size={21} />
          </span>
          <div>
            <p className={styles.dialogEyebrow}>Catalog management</p>
            <h2 id="delete-medicine-title">Remove medicine?</h2>
          </div>
          <button
            type="button"
            className={styles.close}
            aria-label="Close medicine removal dialog"
            disabled={busy}
            onClick={() => setDeleteTarget(null)}
          >
            <X size={19} />
          </button>
        </div>
        <div className={styles.deleteBody}>
          <p>
            <strong>{deleteTarget?.generic_name || "This medicine"}</strong>
            {deleteTarget?.brand_name || deleteTarget?.brand
              ? ` · ${deleteTarget.brand_name || deleteTarget.brand}`
              : ""}{" "}
            will be removed from the catalog. Existing records may remain in
            historical transactions.
          </p>
          {formError && (
            <p role="alert" className={styles.formError}>
              {formError}
            </p>
          )}
        </div>
        <div className={styles.deleteFooter}>
          <button
            type="button"
            className={styles.secondary}
            disabled={busy}
            onClick={() => setDeleteTarget(null)}
          >
            Keep medicine
          </button>
          <button
            type="button"
            className={styles.dangerButton}
            disabled={busy}
            onClick={() => void deleteMedicine()}
          >
            {busy ? (
              <Loader2 size={15} className={styles.spin} />
            ) : (
              <Trash2 size={15} />
            )}
            {busy ? "Removing…" : "Remove medicine"}
          </button>
        </div>
      </CatalogDialog>
    </div>
  );
}

function CatalogField({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  required = false,
  full = false,
  numeric = false,
  hint,
}: {
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  full?: boolean;
  numeric?: boolean;
  hint?: string;
}) {
  return (
    <label className={`${styles.field} ${full ? styles.fullField : ""}`}>
      <span>
        {label}
        {required ? (
          <span className={styles.required} aria-hidden="true">
            {" "}
            *
          </span>
        ) : (
          <span className={styles.optional}>Optional</span>
        )}
      </span>
      <span className={styles.inputWrap}>
        <Icon size={16} aria-hidden="true" />
        <input
          required={required}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          inputMode={numeric ? "numeric" : undefined}
        />
      </span>
      {hint && <span className={styles.hint}>{hint}</span>}
    </label>
  );
}

function CatalogDialog({
  open,
  busy,
  onClose,
  labelledBy,
  compact = false,
  children,
}: {
  open: boolean;
  busy: boolean;
  onClose: () => void;
  labelledBy: string;
  compact?: boolean;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = dialog.current;
    if (!open || !node) return;
    node.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      node.close();
      document.body.style.overflow = overflow;
    };
  }, [open]);
  return (
    <dialog
      ref={dialog}
      className={`${styles.dialog} ${compact ? styles.compactDialog : ""}`}
      aria-labelledby={labelledBy}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      {children}
    </dialog>
  );
}
