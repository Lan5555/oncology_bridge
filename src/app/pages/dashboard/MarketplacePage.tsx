"use client";

import { toast } from "sonner";

import { notifyResult } from "@/app/lib/notifications";

import {
  ArrowRight,
  Building2,
  Check,
  ImagePlus,
  Loader2,
  MapPin,
  Package,
  Pill,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Snowflake,
} from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { useProvider } from "@/app/providers/provider";
import {
  type DrugListing,
  MARKETPLACE_SERVICE,
} from "@/app/services/marketplace-service/marketplace-service";
import marketplace from "./MarketplacePage.module.css";

const money = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(value);
const field =
  "w-full rounded-xl border border-g200 bg-w px-3.5 py-3 text-sm text-g800 outline-none transition focus:border-p focus:ring-2 focus:ring-p/15";
const primary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-p px-5 py-3 text-sm font-semibold text-white transition hover:bg-pd disabled:cursor-not-allowed disabled:opacity-50 dk:text-navy";
const categories = [
  "All medicines",
  "Biologics",
  "Chemotherapy",
  "Supportive care",
  "Other",
];
const dateLabel = (value: string) =>
  Number.isNaN(Date.parse(value))
    ? "Not provided"
    : new Date(value).toLocaleDateString("en-NG", {
        month: "short",
        year: "numeric",
      });
const purchasable = (item: DrugListing) =>
  Number.isFinite(item.unitPriceNaira) &&
  item.unitPriceNaira > 0 &&
  Number.isInteger(item.availableQuantity) &&
  item.availableQuantity > 0 &&
  Date.parse(item.expiresOn) > Date.now();

function ProductImage({
  url,
  alt,
  className = "",
}: {
  url?: string;
  alt: string;
  className?: string;
}) {
  const [failedUrl, setFailedUrl] = useState<string>();
  return (
    <div
      className={`flex items-center justify-center overflow-hidden bg-linear-to-br from-g50 to-pl/30 ${className}`}
    >
      {url && url !== failedUrl ? (
        // biome-ignore lint/performance/noImgElement: Backend image hosts are configured independently and images are served by their CDN.
        <img
          src={url}
          alt={alt}
          loading="lazy"
          className="size-full object-contain p-5 transition duration-300 group-hover:scale-105"
          onError={() => setFailedUrl(url)}
        />
      ) : (
        <div className="flex flex-col items-center gap-3 text-g400">
          <Pill className="size-12" strokeWidth={1.2} />
          <span className="text-xs">Image not available</span>
        </div>
      )}
    </div>
  );
}

export default function MarketplacePage() {
  const { userData } = useProvider();
  const canSell =
    userData.user?.account_type === "PHARMACY_STORE" &&
    userData.user?.verification_status === "VERIFIED";
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("All medicines");
  const [sort, setSort] = useState("newest");
  const [inStock, setInStock] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<DrugListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState({ q: "", location: "" });
  const [selected, setSelected] = useState<DrugListing | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState("1");
  const [prescription, setPrescription] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [paying, setPaying] = useState(false);
  const checkoutKey = useRef("");
  const checkoutLock = useRef(false);
  const detailDialog = useRef<HTMLDialogElement>(null);
  const uploadDialog = useRef<HTMLDialogElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [notice, setNotice] = useState("");

  // biome-ignore lint/correctness/useExhaustiveDependencies: The refresh counter explicitly reloads the same filters after retry or publishing.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setItems([]);
    const params = new URLSearchParams({
      ...search,
      category: category === "All medicines" ? "" : category,
      sort,
      inStock: String(inStock),
      page: String(page),
      limit: "12",
    });
    void MARKETPLACE_SERVICE.list(params).then((response) => {
      if (cancelled) return;
      if (
        response.success &&
        Array.isArray(response.data?.items) &&
        Number.isInteger(response.data?.total)
      ) {
        setItems(response.data.items);
        setTotal(response.data.total);
      } else {
        setTotal(0);
        setError(
          response.message ||
            "The marketplace is unavailable. Please try again.",
        );
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [search, category, sort, inStock, page, refresh]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => {
      urls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [files]);

  const openProduct = (item: DrugListing) => {
    setSelected(item);
    setImageIndex(0);
    setQuantity("1");
    setPrescription("");
    setCheckoutError("");
    checkoutKey.current = crypto.randomUUID();
    detailDialog.current?.showModal();
  };

  const checkout = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected || checkoutLock.current) return;
    const count = Number(quantity);
    if (
      !purchasable(selected) ||
      !Number.isInteger(count) ||
      count < 1 ||
      count > selected.availableQuantity
    ) {
      setCheckoutError("Choose a valid quantity within the available stock.");
      return;
    }
    checkoutLock.current = true;
    setPaying(true);
    setCheckoutError("");
    try {
      const response = await MARKETPLACE_SERVICE.checkout(
        selected.id,
        count,
        prescription.trim(),
        checkoutKey.current,
      );
      if (!response.success)
        throw new Error(
          response.message ||
            "Checkout could not be started. Please try again.",
        );
      const url = new URL(response.data?.authorizationUrl);
      if (
        url.protocol !== "https:" ||
        url.hostname !== "checkout.paystack.com" ||
        url.username ||
        url.password ||
        url.port
      )
        throw new Error(
          "A valid Paystack payment link was not returned. Please try again.",
        );
      window.location.assign(url.href);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Checkout could not be started.",
      );
      setCheckoutError(
        err instanceof Error ? err.message : "Checkout could not be started.",
      );
    } finally {
      checkoutLock.current = false;
      setPaying(false);
    }
  };

  const publish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving || !canSell) return;
    if (!files.length) {
      toast.error("Add at least one product photograph.");
      setUploadError("Add at least one product photograph.");
      return;
    }
    const form = event.currentTarget;
    const data = new FormData(form);
    data.delete("photos");
    files.forEach((file) => {
      data.append("images", file);
    });
    data.set(
      "prescriptionRequired",
      String(data.get("prescriptionRequired") === "on"),
    );
    setSaving(true);
    setUploadError("");
    const response = await MARKETPLACE_SERVICE.createListing(data);
    notifyResult(
      response,
      "Medicine listing submitted.",
      "Medicine listing could not be submitted.",
    );
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
    uploadDialog.current?.close();
    setNotice("Your medicine listing was submitted successfully.");
    setRefresh((value) => value + 1);
  };

  return (
    <div className="animate-fade-up space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-p">
            Oncosourz / Pharmacy network
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-g900">
            Medicine marketplace
          </h1>
        </div>
        {canSell && (
          <button
            type="button"
            className={primary}
            onClick={() => {
              setUploadError("");
              uploadDialog.current?.showModal();
            }}
          >
            <Plus className="size-4" /> List a medicine
          </button>
        )}
      </header>

      <section className="relative isolate overflow-hidden rounded-3xl bg-[#102c45] px-6 py-8 text-white sm:px-9 sm:py-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-28 -z-10 size-96 rounded-full border-[55px] border-white/5"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-36 right-32 -z-10 size-80 rounded-full border-[45px] border-cyan-300/5"
        />
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-cyan-100">
          <ShoppingBag className="size-3.5" /> Your connected medicine network
        </span>
        <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          Better access.
          <br />
          <span className="text-cyan-200">More possibilities for care.</span>
        </h2>
        <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300">
          Find oncology medicines, compare transparent prices, and purchase
          directly from pharmacy facilities in your network.
        </p>
        <div className="mt-7 flex flex-wrap gap-x-7 gap-y-3 text-xs text-slate-200">
          <span className="flex items-center gap-2">
            <Building2 className="size-4 text-cyan-200" /> Facility-supplied
            stock
          </span>
          <span className="flex items-center gap-2">
            <Package className="size-4 text-cyan-200" /> Batch & expiry details
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-cyan-200" /> Paystack checkout
          </span>
        </div>
      </section>

      {notice && (
        <output className="block rounded-xl border border-emerald-200 bg-okl p-4 text-sm text-g800">
          {notice}
        </output>
      )}
      <section
        aria-label="Find medicines"
        className="space-y-4 rounded-2xl border border-g200 bg-w p-4 sm:p-5"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setSearch({ q: query.trim(), location: location.trim() });
            setRefresh((value) => value + 1);
          }}
          className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]"
        >
          <label className="grid gap-2 text-xs font-semibold text-g600">
            Find a medicine
            <div className="relative">
              <Search className="absolute left-3 top-3.5 size-4 text-g400" />
              <input
                className={`${field} pl-10`}
                placeholder="Search generic name or brand"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </label>
          <label className="grid gap-2 text-xs font-semibold text-g600">
            Location
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 size-4 text-g400" />
              <input
                className={`${field} pl-10`}
                placeholder="City or pharmacy"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
            </div>
          </label>
          <button type="submit" className={primary}>
            Search medicines <ArrowRight className="size-4" />
          </button>
        </form>
        <div className="flex flex-wrap gap-2 border-t border-g100 pt-4">
          {categories.map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={category === value}
              onClick={() => {
                setCategory(value);
                setPage(1);
              }}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${category === value ? "bg-p text-white dk:text-navy" : "bg-g50 text-g500 hover:bg-pl hover:text-p"}`}
            >
              {value}
            </button>
          ))}
        </div>
      </section>

      <section
        className={marketplace.listings}
        aria-label="Medicine listings"
        aria-busy={loading}
      >
        <div className={marketplace.toolbar}>
          <div className={marketplace.heading}>
            <h2>Explore medicines</h2>
            <p aria-live="polite">
              {loading
                ? "Finding medicines across the network…"
                : error
                  ? "Listings unavailable"
                  : `${total} ${total === 1 ? "listing" : "listings"} found`}
            </p>
          </div>
          <div className={marketplace.controls}>
            <label className={marketplace.stockFilter}>
              <input
                type="checkbox"
                checked={inStock}
                onChange={(event) => {
                  setInStock(event.target.checked);
                  setPage(1);
                }}
              />
              <span>In stock only</span>
            </label>
            <label className={marketplace.sortFilter}>
              <SlidersHorizontal aria-hidden="true" />
              <span className="sr-only">Sort medicines</span>
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value);
                  setPage(1);
                }}
              >
                <option value="newest">Newest listings</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
                <option value="expiry_asc">Expiry: soonest first</option>
              </select>
            </label>
          </div>
        </div>
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6].map((id) => (
              <div
                key={id}
                className="animate-pulse rounded-2xl border border-g200 bg-w p-4"
              >
                <div className="mb-5 h-44 rounded-xl bg-g100" />
                <div className="mb-3 h-4 w-2/3 rounded bg-g100" />
                <div className="mb-6 h-3 w-1/2 rounded bg-g100" />
                <div className="h-10 rounded-lg bg-g100" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-2xl border border-g200 bg-w px-6 py-14 text-center"
          >
            <Package className="mx-auto mb-4 size-10 text-g400" />
            <h3 className="font-semibold text-g900">
              We couldn’t load the marketplace
            </h3>
            <p className="mx-auto my-3 max-w-md text-sm text-g500">{error}</p>
            <button
              type="button"
              className={primary}
              onClick={() => setRefresh((value) => value + 1)}
            >
              Try again
            </button>
          </div>
        ) : !items.length ? (
          <div className="rounded-2xl border border-dashed border-g200 bg-w px-6 py-16 text-center">
            <Search className="mx-auto mb-4 size-10 text-g400" />
            <h3 className="text-lg font-semibold text-g900">
              {search.q ||
              search.location ||
              category !== "All medicines" ||
              inStock
                ? "No medicines match your search"
                : "New medicines will appear here"}
            </h3>
            <p className="mt-2 text-sm text-g500">
              Try another name or location, or check back as pharmacies add
              stock.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setLocation("");
                setSearch({ q: "", location: "" });
                setCategory("All medicines");
                setInStock(false);
                setPage(1);
              }}
              className="mt-5 text-sm font-semibold text-p"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-g200 bg-w transition duration-200 hover:-translate-y-1 hover:border-p/30 hover:shadow-xl hover:shadow-p/5"
              >
                <button
                  type="button"
                  onClick={() => openProduct(item)}
                  className="relative block w-full text-left"
                  aria-label={`View ${item.name}`}
                >
                  <ProductImage
                    url={item.images?.[0]?.url}
                    alt={item.images?.[0]?.alt || item.name}
                    className="h-52 w-full"
                  />
                  <span
                    className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold ${purchasable(item) ? "bg-w text-g700" : "bg-g100 text-g500"}`}
                  >
                    {purchasable(item)
                      ? `${item.availableQuantity} available`
                      : "Unavailable"}
                  </span>
                  {item.prescriptionRequired && (
                    <span className="absolute bottom-3 right-3 rounded-md bg-w/95 px-2 py-1 text-[10px] font-semibold text-p">
                      Rx required
                    </span>
                  )}
                </button>
                <div className="p-5">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-p">
                    {item.category || "Medicine"}
                  </p>
                  <button
                    type="button"
                    onClick={() => openProduct(item)}
                    className="text-left"
                  >
                    <h3 className="text-base font-bold text-g900">
                      {item.name}
                    </h3>
                  </button>
                  <p className="mt-1 text-xs text-g500">
                    {[item.brand, item.strength].filter(Boolean).join(" · ") ||
                      "Details available from supplier"}
                  </p>
                  <div className="mt-4 space-y-2 border-b border-g100 pb-4 text-xs text-g500">
                    <p className="flex items-center gap-1.5">
                      <Building2 className="size-3.5 shrink-0" />
                      <span className="truncate">{item.seller.name}</span>
                      {item.seller.verified && (
                        <ShieldCheck
                          aria-label="Verified facility"
                          className="size-3.5 shrink-0 text-emerald-600"
                        />
                      )}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="size-3.5" />
                      {item.seller.city || "Location not provided"}
                      <span className="ml-auto text-[10px]">
                        Exp. {dateLabel(item.expiresOn)}
                      </span>
                    </p>
                  </div>
                  <div className="my-4">
                    <p className="text-xl font-bold tracking-tight text-g900">
                      {Number.isFinite(item.unitPriceNaira) &&
                      item.unitPriceNaira > 0
                        ? money(item.unitPriceNaira)
                        : "Price unavailable"}
                    </p>
                    <p className="mt-1 text-[11px] text-g400">
                      per {item.unit || "unit"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openProduct(item)}
                    className={`${primary} w-full`}
                  >
                    <ShoppingBag className="size-4" /> View medicine{" "}
                    <ArrowRight className="ml-auto size-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
        {!loading && !error && total > 12 && (
          <nav
            aria-label="Marketplace pagination"
            className="mt-6 flex items-center justify-center gap-5"
          >
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((value) => value - 1)}
              className="rounded-lg border border-g200 bg-w px-4 py-2 text-sm text-g700 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs text-g500">
              Page {page} of {Math.ceil(total / 12)}
            </span>
            <button
              type="button"
              disabled={page * 12 >= total}
              onClick={() => setPage((value) => value + 1)}
              className="rounded-lg border border-g200 bg-w px-4 py-2 text-sm text-g700 disabled:opacity-40"
            >
              Next
            </button>
          </nav>
        )}
      </section>

      <dialog
        ref={detailDialog}
        onCancel={(event) => {
          if (paying) event.preventDefault();
        }}
        className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-3xl border border-g200 bg-w p-0 text-g800 shadow-2xl backdrop:bg-slate-950/60 backdrop:backdrop-blur-sm"
      >
        {selected && (
          <>
            <div className="flex items-center justify-between border-b border-g100 px-6 py-4">
              <p className="text-xs font-semibold text-g500">
                Medicine details
              </p>
              <button
                type="button"
                disabled={paying}
                onClick={() => detailDialog.current?.close()}
                className="rounded-lg border border-g200 px-3 py-1.5 text-xs text-g600"
              >
                Close
              </button>
            </div>
            <div className="grid gap-6 p-6 md:grid-cols-2">
              <div>
                <ProductImage
                  url={selected.images?.[imageIndex]?.url}
                  alt={selected.images?.[imageIndex]?.alt || selected.name}
                  className="h-64 rounded-2xl"
                />
                {selected.images?.length > 1 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    {selected.images.map((image, index) => (
                      <button
                        type="button"
                        key={image.id}
                        aria-label={`Product image ${index + 1}`}
                        aria-pressed={imageIndex === index}
                        onClick={() => setImageIndex(index)}
                        className={`shrink-0 overflow-hidden rounded-lg border-2 ${imageIndex === index ? "border-p" : "border-g100"}`}
                      >
                        <ProductImage
                          url={image.url}
                          alt={image.alt}
                          className="size-16"
                        />
                      </button>
                    ))}
                  </div>
                )}
                <p className="mt-5 text-sm leading-6 text-g500">
                  {selected.description ||
                    "Contact the supplying facility for further product information."}
                </p>
                <p className="mt-4 flex items-center gap-2 text-xs text-g500">
                  <Snowflake className="size-4 text-p" />
                  {selected.storage || "Storage details not provided"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-p">
                  {selected.category}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-g900">
                  {selected.name}
                </h2>
                <p className="mt-2 text-sm text-g500">
                  {selected.brand} · {selected.strength}
                </p>
                <p className="mt-4 text-xs text-g500">
                  Supplied by {selected.seller.name} · {selected.seller.city}
                </p>
                <dl className="my-5 grid grid-cols-2 gap-3 rounded-xl bg-g50 p-4 text-xs">
                  <div>
                    <dt className="text-g400">Batch</dt>
                    <dd className="mt-1 font-semibold">
                      {selected.batchNumber}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-g400">Expires</dt>
                    <dd className="mt-1 font-semibold">
                      {dateLabel(selected.expiresOn)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-g400">Stock available</dt>
                    <dd className="mt-1 font-semibold">
                      {selected.availableQuantity} {selected.unit}(s)
                    </dd>
                  </div>
                  <div>
                    <dt className="text-g400">Prescription</dt>
                    <dd className="mt-1 font-semibold">
                      {selected.prescriptionRequired
                        ? "Required"
                        : "Not required"}
                    </dd>
                  </div>
                </dl>
                <p className="text-2xl font-bold text-g900">
                  {selected.unitPriceNaira > 0
                    ? money(selected.unitPriceNaira)
                    : "Price unavailable"}
                  <span className="ml-1 text-xs font-normal text-g400">
                    / {selected.unit}
                  </span>
                </p>
                <form onSubmit={checkout} className="mt-5 space-y-4">
                  <label className="grid gap-2 text-xs font-semibold text-g600">
                    Quantity
                    <input
                      className={field}
                      type="number"
                      min="1"
                      step="1"
                      max={selected.availableQuantity}
                      required
                      disabled={paying}
                      value={quantity}
                      onChange={(event) => {
                        setQuantity(event.target.value);
                        checkoutKey.current = crypto.randomUUID();
                      }}
                    />
                  </label>
                  {selected.prescriptionRequired && (
                    <label className="grid gap-2 text-xs font-semibold text-g600">
                      Approved prescription ID
                      <input
                        className={field}
                        required
                        disabled={paying}
                        placeholder="Enter your prescription reference"
                        value={prescription}
                        onChange={(event) => {
                          setPrescription(event.target.value);
                          checkoutKey.current = crypto.randomUUID();
                        }}
                      />
                    </label>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-g500">Estimated subtotal</span>
                    <strong>
                      {Number.isInteger(Number(quantity)) &&
                      Number(quantity) > 0 &&
                      selected.unitPriceNaira > 0
                        ? money(selected.unitPriceNaira * Number(quantity))
                        : "N/A"}
                    </strong>
                  </div>
                  <p className="text-[11px] leading-5 text-g400">
                    Final charges and availability are confirmed at checkout.
                    Prescription items require approval before payment.
                  </p>
                  {checkoutError && (
                    <p role="alert" className="text-xs text-err">
                      {checkoutError}
                    </p>
                  )}
                  <button
                    className={`${primary} w-full`}
                    type="submit"
                    disabled={paying || !purchasable(selected)}
                  >
                    {paying ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="size-4" />
                    )}
                    {paying ? "Preparing checkout…" : "Continue to Paystack"}
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
      </dialog>

      <dialog
        ref={uploadDialog}
        onCancel={(event) => {
          if (saving) event.preventDefault();
        }}
        className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-3xl border border-g200 bg-w p-6 text-g800 shadow-2xl backdrop:bg-slate-950/60 backdrop:backdrop-blur-sm"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-p">
              Pharmacy workspace
            </p>
            <h2 className="mt-2 text-xl font-bold text-g900">
              List a medicine
            </h2>
            <p className="mt-2 text-xs leading-5 text-g500">
              Connect your stock, set a price, and add clear product
              photographs.
            </p>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={() => uploadDialog.current?.close()}
            className="rounded-lg border border-g200 px-3 py-2 text-xs"
          >
            Close
          </button>
        </div>
        <form onSubmit={publish} className="grid gap-4 sm:grid-cols-2">
          <fieldset
            disabled={saving}
            className="col-span-full grid gap-4 sm:grid-cols-2"
          >
            <label className="grid gap-2 text-xs font-semibold text-g600 sm:col-span-2">
              Inventory item ID
              <input
                className={field}
                name="inventoryItemId"
                required
                placeholder="Reference of a batch in your facility inventory"
              />
            </label>
            <label className="grid gap-2 text-xs font-semibold text-g600">
              Category
              <select className={field} name="category">
                {categories.slice(1).map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-xs font-semibold text-g600">
              Price per unit (₦)
              <input
                className={field}
                name="unitPriceNaira"
                type="number"
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
              />
            </label>
            <label className="grid gap-2 text-xs font-semibold text-g600">
              Available quantity
              <input
                className={field}
                name="availableQuantity"
                type="number"
                required
                min="1"
                step="1"
                placeholder="e.g. 20"
              />
            </label>
            <label className="grid gap-2 text-xs font-semibold text-g600">
              Selling unit
              <select className={field} name="unit">
                <option value="vial">Vial</option>
                <option value="pack">Pack</option>
                <option value="bottle">Bottle</option>
                <option value="box">Box</option>
              </select>
            </label>
            <label className="grid gap-2 text-xs font-semibold text-g600 sm:col-span-2">
              Storage requirements
              <input
                className={field}
                name="storage"
                required
                placeholder="Enter the product’s labelled storage requirements"
              />
            </label>
            <label className="grid gap-2 text-xs font-semibold text-g600 sm:col-span-2">
              Product description
              <textarea
                className={field}
                name="description"
                required
                maxLength={2000}
                rows={3}
                placeholder="Describe the product and pack contents"
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-g600 sm:col-span-2">
              <input
                type="checkbox"
                name="prescriptionRequired"
                defaultChecked
                className="accent-p"
              />{" "}
              Prescription required
            </label>
            <div className="sm:col-span-2">
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-p/40 bg-pl/20 p-6 text-center">
                <ImagePlus className="size-7 text-p" />
                <span className="text-sm font-semibold text-g800">
                  Add product photographs
                </span>
                <span className="text-xs text-g500">
                  1–5 JPG, PNG or WebP images · Up to 5 MB each
                </span>
                <input
                  name="photos"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="mt-2 w-full max-w-xs text-xs text-g500"
                  onChange={(event) => {
                    const selectedFiles = Array.from(event.target.files ?? []);
                    if (
                      selectedFiles.length > 5 ||
                      selectedFiles.some(
                        (file) =>
                          !["image/jpeg", "image/png", "image/webp"].includes(
                            file.type,
                          ) || file.size > 5 * 1024 * 1024,
                      )
                    ) {
                      setUploadError(
                        "Choose up to 5 JPG, PNG or WebP images, no larger than 5 MB each.",
                      );
                      event.target.value = "";
                      setFiles([]);
                      return;
                    }
                    setUploadError("");
                    setFiles(selectedFiles);
                  }}
                />
              </label>
              {previews.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {previews.map((url, index) => (
                    <div key={url} className="relative">
                      {/* biome-ignore lint/performance/noImgElement: Local blob URLs are temporary upload previews. */}
                      <img
                        src={url}
                        alt={`Upload preview ${index + 1}`}
                        className="size-20 rounded-xl border border-g200 object-contain"
                      />
                      {index === 0 && (
                        <span className="absolute inset-x-0 bottom-0 rounded-b-xl bg-p px-1 py-1 text-center text-[9px] text-white">
                          Cover image
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-3 text-[11px] leading-5 text-g400">
                Use photographs of the actual product and packaging. Medicine
                name, strength, batch, and expiry come from the linked inventory
                record. The first photo is your cover image.
              </p>
            </div>
          </fieldset>
          {uploadError && (
            <p role="alert" className="col-span-full text-xs text-err">
              {uploadError}
            </p>
          )}
          <button
            className={`${primary} col-span-full`}
            type="submit"
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            {saving ? "Uploading & submitting…" : "Submit medicine listing"}
          </button>
        </form>
      </dialog>
    </div>
  );
}
