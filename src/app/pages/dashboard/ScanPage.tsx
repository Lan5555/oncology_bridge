"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { MonthlyScansChart } from "../../components/Charts";
import Camera from "@/app/components/Camera/camera";
import { SCAN_SERVICE } from "@/app/services/scan-service/scan-service";
import { unwrapArray } from "@/app/services/response-utils";
import EmptyState from "@/app/components/EmptyState";
import { ScanLine } from "lucide-react";

type QueuedScan = {
  gtin: string;
  lot: string;
  expiry: string;
  serial: string;
  facilityId: string;
  action: string;
  notes: string;
  clientUuid: string;
  clientTs: string;
};

const PENDING_SCANS_KEY = "pendingGs1Scans";

export default function ScanPage() {
  const [recent, setRecent] = useState<any[]>([]);
  const [queuedScans, setQueuedScans] = useState<QueuedScan[]>([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [decoding, setDecoding] = useState(false);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupNotice, setLookupNotice] = useState("");
  const [medicine, setMedicine] = useState<any>(null);
  const [validation, setValidation] = useState<any>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState({
    gtin: "",
    lot: "",
    expiry: "",
    serial: "",
    facilityId: "",
    action: "NEW",
    notes: "",
  });
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [queueStorageKey, setQueueStorageKey] = useState(
    `${PENDING_SCANS_KEY}:anonymous`,
  );
  const load = async () => {
    const response = await SCAN_SERVICE.recent(5);
    if (response.success) setRecent(unwrapArray(response.data));
  };
  useEffect(() => {
    void load();
    setIsOnline(navigator.onLine);
    const updateOnline = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    try {
      const session = JSON.parse(
        window.localStorage.getItem("userSession") ?? "{}",
      );
      const user = session.user ?? {};
      const scopeId =
        user.id ??
        user.user_id ??
        user.facility_id ??
        user.facility?.id ??
        session.facilityId ??
        "anonymous";
      const storageKey = `${PENDING_SCANS_KEY}:${scopeId}`;
      setQueueStorageKey(storageKey);
      const pending = JSON.parse(
        window.localStorage.getItem(storageKey) ?? "[]",
      );
      if (Array.isArray(pending)) setQueuedScans(pending);
    } catch {
      window.localStorage.removeItem(queueStorageKey);
    }
    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);
  useEffect(() => {
    try {
      const session = JSON.parse(
        window.localStorage.getItem("userSession") ?? "{}",
      );
      const user = session.user ?? {};
      const facilityId =
        user.facility_id ??
        user.facility?.id ??
        user.hospital?.id ??
        session.facilityId ??
        "";
      if (facilityId) setForm((current) => ({ ...current, facilityId }));
    } catch {
      // The operator can still supply the facility ID manually if session data is unavailable.
    }
  }, []);
  const lookupMedicine = async (gtin = form.gtin) => {
    const normalizedGtin = gtin.trim();
    if (!normalizedGtin) {
      setLookupNotice("Enter a GTIN before looking up a medicine.");
      return null;
    }
    setLookupBusy(true);
    const response = await SCAN_SERVICE.lookup(normalizedGtin);
    setLookupBusy(false);
    if (!response.success) {
      setMedicine(null);
      setLookupNotice(response.message || "Medicine lookup failed.");
      return null;
    }
    const result = (response.data as any)?.medicine ?? response.data;
    setMedicine(result || null);
    setLookupNotice(
      result
        ? "Medicine found in the catalog."
        : "No catalog medicine matches this GTIN. You can still submit the identifiers.",
    );
    return result || null;
  };
  const saveQueue = (items: QueuedScan[]) => {
    setQueuedScans(items);
    window.localStorage.setItem(queueStorageKey, JSON.stringify(items));
  };
  const syncQueuedScans = async () => {
    if (!queuedScans.length || syncing) return;
    if (!navigator.onLine) {
      setNotice(
        "You are offline. Pending scans will stay saved on this device.",
      );
      return;
    }
    setSyncing(true);
    const response = await SCAN_SERVICE.batch(queuedScans);
    setSyncing(false);
    if (!response.success) {
      setNotice(response.message || "Queued scans could not be synchronized.");
      return;
    }
    const payload = response.data as any;
    const results = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.results)
        ? payload.results
        : Array.isArray(payload?.data)
          ? payload.data
          : null;
    if (!results) {
      setNotice(
        "The server did not return item-level results. Pending scans were kept.",
      );
      return;
    }
    const resultsById = new Map(
      results
        .filter((result: any) => result?.clientUuid)
        .map((result: any) => [result.clientUuid, result]),
    );
    const remaining = queuedScans.filter((scan) => {
      const result = resultsById.get(scan.clientUuid) as any;
      return (
        !result ||
        result.success === false ||
        ["FAILED", "ERROR"].includes(result.status)
      );
    });
    saveQueue(remaining);
    setNotice(
      remaining.length
        ? `${queuedScans.length - remaining.length} scan(s) synced; ${remaining.length} remain queued.`
        : `${queuedScans.length} scan(s) synchronized.`,
    );
    await load();
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    const payload: QueuedScan = {
      ...form,
      clientUuid: crypto.randomUUID(),
      clientTs: new Date().toISOString(),
    };
    const response = await SCAN_SERVICE.create(payload);
    const scanResult = response.data as any;
    const savedStatus = scanResult?.result ?? scanResult?.status;
    setNotice(
      response.message ||
        (response.success && savedStatus
          ? `Scan recorded with status ${savedStatus}.`
          : response.success
            ? "Scan submitted to the inventory ledger."
            : "Scan could not be submitted."),
    );
    if (response.success) {
      setForm({
        ...form,
        gtin: "",
        lot: "",
        expiry: "",
        serial: "",
        notes: "",
      });
      setMedicine(null);
      setValidation(null);
      setLookupNotice("");
      await load();
    } else if (
      !navigator.onLine ||
      /failed to fetch|network request failed|load failed/i.test(
        response.message,
      )
    ) {
      saveQueue([...queuedScans, payload]);
      setNotice(
        "Network unavailable. Scan saved on this device for later synchronization.",
      );
      setForm({
        ...form,
        gtin: "",
        lot: "",
        expiry: "",
        serial: "",
        notes: "",
      });
    }
    setBusy(false);
  };
  const decodeImage = async (image: Blob) => {
    setDecoding(true);
    const response = await SCAN_SERVICE.decode(image, {
      facilityId: form.facilityId,
      action: form.action,
      notes: form.notes,
      clientUuid: crypto.randomUUID(),
      clientTs: new Date().toISOString(),
    });
    setDecoding(false);
    const responseData = response.data as any;
    const hasDecodedIdentifiers = Boolean(
      responseData?.identifiers ?? responseData?.decoded,
    );
    if (!response.success && !hasDecodedIdentifiers) {
      setNotice(
        response.message ||
          "Camera decoding failed. Enter the GS1 values manually.",
      );
      return;
    }
    const decoded =
      responseData?.identifiers ?? responseData?.decoded ?? response.data ?? {};
    const decodeResult = responseData;
    setValidation(decodeResult?.validation ?? null);
    const identifiers = {
      gtin: decoded.gtin ?? decoded.GTIN ?? "",
      lot: decoded.lot ?? decoded.batch ?? decoded.batchNumber ?? "",
      expiry: decoded.expiry ?? decoded.expiryDate ?? "",
      serial: decoded.serial ?? decoded.serialNumber ?? "",
    };
    if (!identifiers.gtin) {
      setNotice(
        "The image was received, but no GS1 identifiers were returned. Try again or enter them manually.",
      );
      return;
    }
    setForm((current) => ({ ...current, ...identifiers }));
    if (decodeResult?.medicine) {
      setMedicine(decodeResult.medicine);
      setLookupNotice("Medicine matched during GS1 decode.");
    } else {
      await lookupMedicine(identifiers.gtin);
    }
    setNotice(
      decodeResult?.validation?.valid === false
        ? "Identifiers decoded with validation issues. Review and correct them before submitting."
        : response.message ||
            "Identifiers decoded. Review the values, then submit them to the ledger.",
    );
    setCameraOpen(false);
    window.setTimeout(
      () =>
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      0,
    );
  };
  const field = (key: keyof typeof form, label: string, type = "text") => (
    <label className="text-xs font-semibold text-g600" key={key}>
      {label}
      <input
        className="mt-1 w-full rounded-lg border border-g200 px-3 py-2.5 text-sm font-normal"
        required={key !== "notes"}
        type={type}
        value={form[key]}
        onChange={(event) => {
          setForm((current) => ({ ...current, [key]: event.target.value }));
          setValidation(null);
          if (key === "gtin") {
            setMedicine(null);
            setLookupNotice("");
          }
        }}
      />
    </label>
  );
  return (
    <div className="block animate-fade-up">
      <header className="mb-6 rounded-2xl border border-g200 bg-linear-to-br from-w via-w to-pll p-5 shadow-sm">
        <h1 className="flex items-center gap-2 text-xl font-bold text-g900">
          <ScanLine className="size-5 text-p" aria-hidden="true" />
          GS1 DataMatrix Scanner
        </h1>
        <p className="mt-1 text-[12.5px] text-g500">
          Validate and log product identifiers
        </p>
      </header>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-4">
          <section className="rounded-xl border border-g200 bg-w p-6">
            <div className="mb-4">
              <h2 className="text-[15px] font-bold text-g900">
                Scan a product
              </h2>
              <p className="mt-1 text-xs text-g500">
                Capture the GS1 DataMatrix to decode GTIN, lot, expiry date, and
                serial number.
              </p>
            </div>
            <button
              className="group relative flex min-h-52 w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-g300 bg-g50 px-5 py-7 text-center transition hover:border-p hover:bg-pll"
              onClick={() => setCameraOpen(true)}
              type="button"
            >
              <span className="pointer-events-none absolute inset-5 rounded-lg border border-p/40" />
              <span className="pointer-events-none absolute inset-x-8 top-1/2 h-0.5 animate-pulse bg-p/70 shadow-[0_0_12px_rgba(8,145,178,0.55)]" />
              <span className="relative mb-3 flex size-12 items-center justify-center rounded-xl bg-pl text-p">
                <svg
                  className="size-6 fill-none stroke-current stroke-2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </span>
              <span className="relative text-sm font-semibold text-g800">
                Tap to activate camera
              </span>
              <span className="relative mt-1 text-xs text-g500">
                Aim at the DataMatrix, then capture and decode
              </span>
            </button>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className="rounded-lg bg-p px-3.5 py-2 text-xs font-semibold text-white"
                onClick={() => setCameraOpen(true)}
                type="button"
              >
                Camera scan
              </button>
              <button
                className="rounded-lg border border-g200 bg-w px-3.5 py-2 text-xs font-semibold text-g700 hover:border-p"
                onClick={() =>
                  formRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
                type="button"
              >
                Manual entry
              </button>
            </div>
            <p className="mt-3 text-[11px] leading-5 text-g500">
              Camera capture calls <code>POST /api/scans/decode</code>. Review
              the decoded values and submit them to <code>POST /api/scans</code>
              .
            </p>
          </section>
          <form
            ref={formRef}
            className="rounded-xl border border-g200 bg-w p-6"
            onSubmit={(event) => void submit(event)}
          >
            <h2 className="mb-4 text-[15px] font-bold text-g900">
              Log scanned item
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {field("gtin", "GTIN (14 digits)")}
              {field("lot", "Lot / batch number")}
              {field("expiry", "Expiry date", "date")}
              {field("serial", "Serial number")}
              {field("facilityId", "Facility ID (UUID)")}
              <label className="text-xs font-semibold text-g600">
                Action
                <select
                  className="mt-1 w-full rounded-lg border border-g200 bg-white px-3 py-2.5 text-sm font-normal"
                  value={form.action}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      action: event.target.value,
                    }))
                  }
                >
                  <option value="NEW">New stock</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="NEAR_EXPIRY">Near expiry</option>
                </select>
              </label>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                className="rounded-lg border border-g200 bg-w px-3 py-2 text-xs font-semibold text-g700 hover:border-p disabled:opacity-50"
                disabled={lookupBusy || !form.gtin.trim()}
                onClick={() => void lookupMedicine()}
                type="button"
              >
                {lookupBusy ? "Looking up…" : "Look up GTIN"}
              </button>
              {lookupNotice ? (
                <p className="text-xs text-g600" role="status">
                  {lookupNotice}
                </p>
              ) : null}
            </div>
            {medicine ? (
              <div className="mt-3 rounded-lg border border-g200 bg-g50 p-3 text-sm">
                <p className="font-semibold text-g800">
                  {medicine.generic_name ?? medicine.name ?? "Medicine"}
                  {medicine.brand ? ` · ${medicine.brand}` : ""}
                </p>
                {medicine.gtin ? (
                  <p className="mt-1 text-xs text-g500">GTIN {medicine.gtin}</p>
                ) : null}
              </div>
            ) : null}
            {validation ? (
              <div
                className={`mt-3 rounded-lg border p-3 text-sm ${validation.valid ? "border-good/30 bg-okl text-good" : "border-warn/40 bg-warnl text-g800"}`}
                role="status"
              >
                <p className="font-semibold">
                  GS1 validation:{" "}
                  {validation.status ??
                    (validation.valid ? "VALID" : "REVIEW REQUIRED")}
                </p>
                {Array.isArray(validation.messages) &&
                validation.messages.length ? (
                  <ul className="mt-1 list-disc pl-5 text-xs">
                    {validation.messages.map(
                      (message: string, index: number) => (
                        <li key={`${message}-${index}`}>{message}</li>
                      ),
                    )}
                  </ul>
                ) : null}
              </div>
            ) : null}
            <label className="mt-3 block text-xs font-semibold text-g600">
              Notes
              <textarea
                className="mt-1 w-full rounded-lg border border-g200 px-3 py-2.5 text-sm font-normal"
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
              />
            </label>
            <button
              disabled={busy}
              className="mt-4 rounded-lg bg-p px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {busy ? "Submitting…" : "Submit to ledger"}
            </button>
            {notice ? (
              <p className="mt-3 text-sm text-g600" role="status">
                {notice}
              </p>
            ) : null}
          </form>
        </div>
        <div className="flex flex-col gap-4">
          {queuedScans.length ? (
            <section className="rounded-xl border border-warn/40 bg-warnl p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-g900">
                    Pending offline scans
                  </h2>
                  <p className="mt-1 text-xs text-g700">
                    {queuedScans.length} scan(s) are saved on this device and
                    have not been confirmed by the server.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={syncing || !isOnline}
                  onClick={() => void syncQueuedScans()}
                  className="rounded-lg bg-p px-3.5 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {syncing ? "Synchronizing…" : "Sync pending scans"}
                </button>
              </div>
            </section>
          ) : null}
          <section className="rounded-xl border border-g200 bg-w p-5">
            <h2 className="mb-3 text-[15px] font-bold text-g900">
              Monthly scans
            </h2>
            <div className="relative h-[170px]">
              <MonthlyScansChart />
            </div>
          </section>
          <section className="rounded-xl border border-g200 bg-w p-5">
            <h2 className="mb-3 text-[15px] font-bold text-g900">
              Recent scans
            </h2>
            {recent.map((scan, index) => (
              <article
                className="border-t border-g100 py-3"
                key={scan.id ?? index}
              >
                <p className="text-sm font-semibold text-g800">
                  {scan.lot ?? scan.batchNumber ?? "Scan"} ·{" "}
                  {scan.drug ?? scan.gtin}
                </p>
                <p className="mt-1 text-xs text-g500">
                  {scan.result ?? scan.status ?? "—"} ·{" "}
                  {scan.at
                    ? new Date(scan.at).toLocaleString("en-NG")
                    : scan.gtin}
                </p>
              </article>
            ))}
            {!recent.length ? (
              <EmptyState
                compact
                icon={ScanLine}
                title="Ready for your first scan"
                description="Capture a GS1 DataMatrix or enter identifiers to build your scan history."
              />
            ) : null}
          </section>
        </div>
      </div>
      {cameraOpen ? (
        <Camera
          onCapture={decodeImage}
          onClose={() => setCameraOpen(false)}
          busy={decoding}
        />
      ) : null}
    </div>
  );
}
