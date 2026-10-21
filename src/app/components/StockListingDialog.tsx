"use client";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ImagePlus,
  Loader2,
  Package,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import {
  inventoryBatchRows,
  type ListingStock,
  listingStock,
  unavailableStockMessage,
} from "@/app/lib/listing-stock";
import { MEDICINE_CATALOGUE_CHANGED } from "@/app/lib/medicine-availability";
import { notifyResult } from "@/app/lib/notifications";
import { INVENTORY_SERVICE } from "@/app/services/inventory-service/inventory-service";
import { MARKETPLACE_SERVICE } from "@/app/services/marketplace-service/marketplace-service";
import styles from "./StockListingDialog.module.css";

const categories = [
  "All medicines",
  "Biologics",
  "Chemotherapy",
  "Supportive care",
  "Other",
];
export default function StockListingDialog({
  onClose,
  onSubmitted,
}: {
  onClose: () => void;
  onSubmitted: (message: string) => void;
}) {
  const uploadDialog = useRef<HTMLDialogElement>(null);
  const submitLock = useRef(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [stock, setStock] = useState<ListingStock[]>([]);
  const [stockId, setStockId] = useState("");
  const [stockError, setStockError] = useState("");
  const [emptyStockMessage, setEmptyStockMessage] = useState("");
  const [loadingStock, setLoadingStock] = useState(true);
  const [stockPage, setStockPage] = useState(0);
  const [hasMoreStock, setHasMoreStock] = useState(false);
  const [price, setPrice] = useState("");
  const [listingQuantity, setListingQuantity] = useState("");
  const selectedStock = stock.find((item) => item.id === stockId);
  const unit = selectedStock?.unit ?? "";
  const loadStock = useCallback(async (page: number) => {
    setLoadingStock(true);
    setStockError("");
    if (page === 1) {
      setStockId("");
      setStock([]);
    }
    const response = await INVENTORY_SERVICE.list(
      `category=all&page=${page}&limit=100`,
    );
    if (!response.success) {
      setStockError(response.message || "Inventory could not be loaded.");
      setLoadingStock(false);
      return;
    }
    const data = response.data;
    const rows = inventoryBatchRows(data);
    const eligible = listingStock(rows);
    setEmptyStockMessage(unavailableStockMessage(rows));
    setStock((current) => [
      ...new Map(
        (page === 1 ? eligible : [...current, ...eligible]).map((item) => [
          item.id,
          item,
        ]),
      ).values(),
    ]);
    const total = data?.total ?? data?.pagination?.total ?? data?.meta?.total;
    const limit =
      data?.limit ?? data?.pagination?.limit ?? data?.meta?.limit ?? 100;
    setHasMoreStock(
      typeof total === "number" && rows.length > 0 && page * limit < total,
    );
    setStockPage(page);
    setLoadingStock(false);
  }, []);
  useEffect(() => {
    const dialog = uploadDialog.current;
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    if (dialog && !dialog.open) dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);
  useEffect(() => {
    void loadStock(1);
    const refresh = () => void loadStock(1);
    window.addEventListener(MEDICINE_CATALOGUE_CHANGED, refresh);
    return () =>
      window.removeEventListener(MEDICINE_CATALOGUE_CHANGED, refresh);
  }, [loadStock]);
  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => {
      urls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [files]);

  const publish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving || submitLock.current) return;
    if (!selectedStock) {
      setUploadError("Select an available inventory batch.");
      return;
    }
    if (!selectedStock.unit) {
      setUploadError(
        "This batch has no supported selling unit. Have its inventory selling unit recorded and reviewed before listing it.",
      );
      return;
    }
    if (!selectedStock.storage) {
      setUploadError(
        "The medicine's approved storage requirements are missing. Update the medicine record or ask your administrator to include them in the inventory response, then refresh stock.",
      );
      return;
    }
    if (!files.length) {
      toast.error("Add at least one product photograph.");
      setUploadError("Add at least one product photograph.");
      return;
    }
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("unit", selectedStock.unit);
    data.set("storage", selectedStock.storage);
    const count = Number(data.get("availableQuantity"));
    if (
      !Number.isInteger(count) ||
      count < 1 ||
      count > selectedStock.quantity
    ) {
      setUploadError("Choose a quantity within this batch's available stock.");
      return;
    }
    data.delete("photos");
    files.forEach((file) => {
      data.append("images", file);
    });
    data.set(
      "prescriptionRequired",
      String(data.get("prescriptionRequired") === "on"),
    );
    submitLock.current = true;
    setSaving(true);
    setUploadError("");
    const response = await MARKETPLACE_SERVICE.createListing(data);
    notifyResult(
      response,
      "Medicine listing submitted.",
      "Medicine listing could not be submitted.",
    );
    submitLock.current = false;
    setSaving(false);
    if (!response.success) {
      setUploadError(
        response.message ||
          "The listing could not be published. Your details have been kept.",
      );
      return;
    }
    form.reset();
    setFiles([]);
    const status = response.data?.listing?.status;
    onSubmitted(
      status === "PENDING_REVIEW"
        ? "Listing submitted for review. It will appear in Marketplace after approval."
        : status === "PUBLISHED"
          ? "Listing published. Buyers can now find it in Marketplace."
          : "Listing submitted successfully. Publication status is managed by the backend.",
    );
  };

  const addPhotos = (incoming: File[]) => {
    const combined = [...files, ...incoming].filter(
      (file, index, all) =>
        all.findIndex(
          (other) =>
            other.name === file.name &&
            other.size === file.size &&
            other.lastModified === file.lastModified,
        ) === index,
    );
    if (
      combined.length > 5 ||
      combined.some(
        (file) =>
          !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
          file.size > 5 * 1024 * 1024 ||
          file.size === 0,
      )
    ) {
      setUploadError(
        "Choose up to 5 JPG, PNG or WebP images, no larger than 5 MB each.",
      );
      return;
    }
    setUploadError("");
    setFiles(combined);
  };
  const stockValue = Number(price) * Number(listingQuantity);
  const money = (value: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(value);

  return (
    <dialog
      ref={uploadDialog}
      className={styles.dialog}
      aria-labelledby="stock-listing-title"
      aria-describedby="stock-listing-description"
      onClose={onClose}
      onCancel={(event) => {
        if (saving) event.preventDefault();
      }}
    >
      <form onSubmit={publish} className={styles.layout} aria-busy={saving}>
        <header className={styles.header}>
          <div className={styles.headerIcon}>
            <Package size={22} aria-hidden="true" />
          </div>
          <div className={styles.heading}>
            <p className={styles.eyebrow}>Inventory / New listing</p>
            <h2 id="stock-listing-title">Create marketplace listing</h2>
            <p id="stock-listing-description">
              Choose your stock and prepare it for buyers.
            </p>
          </div>
          <button
            type="button"
            className={styles.close}
            aria-label="Close listing dialog"
            disabled={saving}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </header>

        <div className={styles.body}>
          <fieldset disabled={saving} className={styles.fields}>
            <legend className={styles.srOnly}>Listing information</legend>
            <div className={styles.main}>
              <section
                className={styles.section}
                aria-labelledby="listing-stock-heading"
              >
                <div className={styles.sectionHeading}>
                  <span>01</span>
                  <div>
                    <h3 id="listing-stock-heading">Select a stock batch</h3>
                    <p>Link this listing to your facility’s inventory.</p>
                  </div>
                </div>
                <label className={styles.label} htmlFor="listing-stock">
                  Inventory batch <span>Required</span>
                </label>
                <select
                  id="listing-stock"
                  name="inventoryItemId"
                  required
                  className={styles.input}
                  value={stockId}
                  disabled={loadingStock || !stock.length}
                  onChange={(event) => {
                    setStockId(event.target.value);
                    setListingQuantity("");
                    setUploadError("");
                  }}
                >
                  <option value="" disabled>
                    {loadingStock
                      ? "Loading your inventory…"
                      : stock.length
                        ? "Choose a medicine and batch"
                        : "No eligible batches available"}
                  </option>
                  {stock.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} · {item.batch} · {item.quantity} available
                    </option>
                  ))}
                </select>
                {selectedStock ? (
                  <div className={styles.stockDetails}>
                    <div>
                      <Package size={15} />
                      <span>
                        Batch<strong>{selectedStock.batch}</strong>
                      </span>
                    </div>
                    <div>
                      <CalendarDays size={15} />
                      <span>
                        Expires
                        <strong>
                          {new Date(selectedStock.expiry).toLocaleDateString(
                            "en-NG",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        </strong>
                      </span>
                    </div>
                    <div>
                      <Check size={15} />
                      <span>
                        Available<strong>{selectedStock.quantity} units</strong>
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className={styles.hint}>
                    {!loadingStock && !stock.length && !stockError
                      ? emptyStockMessage
                      : "Medicine details, batch number, and expiry are taken from the selected stock."}
                  </p>
                )}
                {stockError && (
                  <p role="alert" className={styles.inlineError}>
                    {stockError}
                  </p>
                )}
                <div className={styles.stockActions}>
                  <button
                    type="button"
                    disabled={loadingStock}
                    onClick={() => void loadStock(1)}
                  >
                    <RefreshCw
                      size={13}
                      className={loadingStock ? styles.spin : undefined}
                    />
                    {loadingStock ? "Loading stock…" : "Refresh stock"}
                  </button>
                  {hasMoreStock && (
                    <button
                      type="button"
                      disabled={loadingStock}
                      onClick={() => void loadStock(stockPage + 1)}
                    >
                      Load more batches <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </section>

              <section
                className={styles.section}
                aria-labelledby="listing-selling-heading"
              >
                <div className={styles.sectionHeading}>
                  <span>02</span>
                  <div>
                    <h3 id="listing-selling-heading">Selling details</h3>
                    <p>Set the price and quantity buyers will see.</p>
                  </div>
                </div>
                <div className={styles.grid}>
                  <label className={styles.label}>
                    Category
                    <select className={styles.input} name="category">
                      {categories.slice(1).map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>
                  </label>
                  <label className={styles.label}>
                    Inventory selling unit
                    <input
                      className={styles.input}
                      name="unit"
                      value={unit}
                      readOnly
                      placeholder="Select a batch first"
                      aria-describedby="listing-unit-help"
                    />
                  </label>
                  <label className={styles.label}>
                    Price per unit (₦)
                    <input
                      className={styles.input}
                      name="unitPriceNaira"
                      type="number"
                      min="0.01"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={price}
                      onChange={(event) => setPrice(event.target.value)}
                    />
                  </label>
                  <label className={styles.label}>
                    Quantity to list
                    <input
                      className={styles.input}
                      name="availableQuantity"
                      type="number"
                      min="1"
                      step="1"
                      required
                      max={selectedStock?.quantity}
                      placeholder="Enter quantity"
                      value={listingQuantity}
                      onChange={(event) =>
                        setListingQuantity(event.target.value)
                      }
                      aria-describedby="listing-quantity-help"
                    />
                  </label>
                </div>
                <p
                  id="listing-unit-help"
                  className={
                    selectedStock && !unit ? styles.inlineError : styles.hint
                  }
                >
                  {selectedStock && !unit
                    ? "This batch has no supported selling unit. Ask your facility administrator to record and review its unit, then refresh stock."
                    : "The selling unit comes from the inventory batch and cannot be changed in a listing."}
                </p>
                <p id="listing-quantity-help" className={styles.hint}>
                  {selectedStock
                    ? `You can list up to ${selectedStock.quantity} ${unit ? `${unit}(s)` : "units"} from this batch. Price and quantity must use this same unit.`
                    : "Select a batch to see how much stock is available."}
                </p>
                <label className={styles.label}>
                  Storage requirements
                  <input
                    className={styles.input}
                    name="storage"
                    readOnly
                    value={selectedStock?.storage ?? ""}
                    placeholder={
                      selectedStock
                        ? "Approved storage requirements not available"
                        : "Select a batch first"
                    }
                    aria-describedby="listing-storage-help"
                  />
                </label>
                <p
                  id="listing-storage-help"
                  className={
                    selectedStock && !selectedStock.storage
                      ? styles.inlineError
                      : styles.hint
                  }
                >
                  {selectedStock && !selectedStock.storage
                    ? "The selected medicine's approved storage requirements were not returned. Have its medicine record and inventory response updated, then refresh stock."
                    : "Filled automatically from the selected medicine’s approved storage requirements."}
                </p>
                <label className={styles.label}>
                  Product description
                  <textarea
                    className={styles.input}
                    name="description"
                    required
                    rows={3}
                    maxLength={2000}
                    placeholder="Describe the product, pack contents, and relevant details."
                  />
                </label>
                <label className={styles.prescription}>
                  <input
                    type="checkbox"
                    name="prescriptionRequired"
                    defaultChecked
                  />
                  <ShieldCheck size={18} aria-hidden="true" />
                  <span>
                    <strong>Prescription required</strong>
                    <small>Buyers must provide an approved prescription.</small>
                  </span>
                </label>
              </section>
            </div>

            <aside
              className={styles.aside}
              aria-label="Product photographs and listing summary"
            >
              <section
                className={styles.photoSection}
                aria-labelledby="listing-photos-heading"
              >
                <div className={styles.photoHeading}>
                  <h3 id="listing-photos-heading">Product photographs</h3>
                  <span>{files.length}/5</span>
                </div>
                <p className={styles.hint}>
                  Show the actual medicine and its packaging. The first photo is
                  your cover.
                </p>
                <label className={styles.upload}>
                  <ImagePlus size={28} aria-hidden="true" />
                  <strong>
                    {files.length >= 5
                      ? "Photo limit reached"
                      : files.length
                        ? "Add more photographs"
                        : "Choose photographs"}
                  </strong>
                  <span>
                    {files.length >= 5
                      ? "Remove a photo to add another"
                      : "JPG, PNG or WebP · Up to 5 MB each"}
                  </span>
                  <input
                    className={styles.fileInput}
                    type="file"
                    name="photos"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    disabled={files.length >= 5}
                    onChange={(event) => {
                      addPhotos(Array.from(event.target.files ?? []));
                      event.target.value = "";
                    }}
                  />
                </label>
                {previews.length > 0 && (
                  <div className={styles.previews}>
                    {previews.map((url, index) => (
                      <div key={url} className={styles.preview}>
                        {/* biome-ignore lint/performance/noImgElement: Local blob URLs are temporary upload previews. */}
                        <img
                          src={url}
                          alt={`Product photograph ${index + 1}`}
                        />
                        <button
                          type="button"
                          className={styles.removePhoto}
                          aria-label={`Remove photograph ${index + 1}`}
                          onClick={() =>
                            setFiles((current) =>
                              current.filter((_, i) => i !== index),
                            )
                          }
                        >
                          <X size={13} />
                        </button>
                        {index === 0 ? (
                          <span className={styles.cover}>Cover</span>
                        ) : (
                          <button
                            type="button"
                            className={styles.makeCover}
                            onClick={() =>
                              setFiles((current) => [
                                current[index],
                                ...current.filter((_, i) => i !== index),
                              ])
                            }
                          >
                            Make cover
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <p className={styles.hint}>
                  At least one photograph is required.
                </p>
              </section>

              <section
                className={styles.summary}
                aria-labelledby="listing-summary-heading"
              >
                <p className={styles.eyebrow}>At a glance</p>
                <h3 id="listing-summary-heading">Listing summary</h3>
                <p className={styles.summaryName}>
                  {selectedStock?.name ?? "Select a medicine batch"}
                </p>
                <dl>
                  <div>
                    <dt>Price per {unit || "unit"}</dt>
                    <dd>{Number(price) > 0 ? money(Number(price)) : "—"}</dd>
                  </div>
                  <div>
                    <dt>Quantity to list</dt>
                    <dd>{listingQuantity || "—"}</dd>
                  </div>
                  <div className={styles.total}>
                    <dt>Value of listed stock</dt>
                    <dd>
                      {Number.isFinite(stockValue) &&
                      Number(price) > 0 &&
                      Number(listingQuantity) > 0
                        ? money(stockValue)
                        : "—"}
                    </dd>
                  </div>
                </dl>
                <p className={styles.hint}>
                  Your listing appears in Marketplace once published or
                  approved.
                </p>
              </section>
            </aside>
          </fieldset>
        </div>

        <footer className={styles.footer}>
          {uploadError && (
            <p role="alert" className={styles.error}>
              {uploadError}
            </p>
          )}
          <div className={styles.footerRow}>
            <p>Review the batch, price, and photos before submitting.</p>
            <div className={styles.footerActions}>
              <button
                type="button"
                className={styles.secondary}
                disabled={saving}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.primary}
                disabled={
                  saving || !selectedStock?.unit || !selectedStock?.storage
                }
              >
                {saving ? (
                  <Loader2 size={16} className={styles.spin} />
                ) : (
                  <ArrowRight size={16} />
                )}
                {saving ? "Submitting…" : "Submit listing"}
              </button>
            </div>
          </div>
        </footer>
      </form>
    </dialog>
  );
}
