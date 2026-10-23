"use client";

import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import management from "@/app/components/Management.module.css";
import RecordImageGallery from "@/app/components/RecordImageGallery";
import {
  ADMIN_RESOURCE_SERVICE,
  ADMIN_RESOURCES,
  type AdminResourceId,
} from "@/app/services/admin-service/admin-resources";

type Row = Record<string, unknown>;
const money = (value: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(
    value,
  );
function object(value: unknown): Row {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Row)
    : {};
}
function records(value: unknown): Row[] | null {
  if (Array.isArray(value))
    return value.filter(
      (row): row is Row =>
        row !== null && typeof row === "object" && !Array.isArray(row),
    );
  const data = object(value);
  for (const key of [
    "items",
    "medicines",
    "inventory",
    "listings",
    "orders",
    "prescriptions",
    "invoices",
    "transfers",
    "scans",
    "units",
    "storageUnits",
    "events",
    "facilities",
    "inquiries",
    "rows",
    "results",
  ]) {
    if (Array.isArray(data[key])) return records(data[key]);
  }
  return data.data ? records(data.data) : null;
}
function read(row: Row, paths: string[]): unknown {
  for (const path of paths) {
    const value = path
      .split(".")
      .reduce<unknown>((current, key) => object(current)[key], row);
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}
function display(value: unknown): string {
  if (value == null || value === "") return "Not provided";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object")
    return String(
      read(object(value), ["name", "generic_name", "reference", "id"]) ??
        "View details",
    );
  return String(value).replaceAll("_", " ");
}
function safeDetails(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(safeDetails);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(object(value))
        .filter(
          ([key]) =>
            !/password|secret|token|credential|private.?key/i.test(key) &&
            !/^id$|_id$|Id$|ID$/.test(key),
        )
        .map(([key, item]) => [key, safeDetails(item)]),
    );
  return value;
}
function DetailValue({ value }: { value: unknown }) {
  if (Array.isArray(value))
    return value.length ? (
      <div className="space-y-3">
        {value.map((item, index) => (
          <div key={String(index)} className="rounded-lg bg-g50 p-3">
            <DetailValue value={item} />
          </div>
        ))}
      </div>
    ) : (
      <span>No entries recorded</span>
    );
  if (value && typeof value === "object")
    return (
      <details>
        <summary>View recorded details</summary>
        <dl className={management.recordFields}>
          {Object.entries(object(value)).map(([key, item]) => (
            <div key={key} className={management.recordField}>
              <dt>
                {key.replace(/([a-z])([A-Z])/g, "$1 $2").replaceAll("_", " ")}
              </dt>
              <dd>
                <DetailValue value={item} />
              </dd>
            </div>
          ))}
        </dl>
      </details>
    );
  return <span>{display(value)}</span>;
}

export default function AdminRecordsPage({
  resource,
}: {
  resource: AdminResourceId;
}) {
  const config = ADMIN_RESOURCES[resource];
  const Icon = config.icon;
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Row | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Refresh intentionally reloads the current resource and filters.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setRows([]);
    void ADMIN_RESOURCE_SERVICE.list(resource, page, search).then(
      (response) => {
        if (cancelled) return;
        const found = records(response.data);
        if (!response.success || !found) {
          setError(
            response.message ||
              "Records could not be loaded. Please try again.",
          );
          setTotal(null);
        } else {
          setRows(found);
          const data = object(response.data);
          const count =
            data.total ??
            object(data.pagination).total ??
            object(data.meta).total;
          setTotal(
            typeof count === "number" && Number.isFinite(count) ? count : null,
          );
        }
        setLoading(false);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [resource, page, search, refresh]);
  const open = (row: Row) => {
    setSelected(row);
    dialog.current?.showModal();
  };

  return (
    <div className={management.team}>
      <header className={management.teamHeader}>
        <div>
          <div className={management.teamKicker}>
            <Icon className="size-3.5" />
            Network operations
          </div>
          <h1>{config.label}</h1>
          <p>{config.description}</p>
        </div>
        <button
          type="button"
          disabled={loading}
          className={management.secondaryButton}
          onClick={() => setRefresh((value) => value + 1)}
        >
          <RefreshCw
            className={"size-3.5 " + (loading ? "animate-spin" : "")}
          />
          Refresh
        </button>
      </header>
      <section
        className={management.teamPanel}
        aria-label={config.label}
        aria-busy={loading}
      >
        <div className={management.teamPanelHeader}>
          <div>
            <h2>All network records</h2>
            <p>Inspect records and their facility details in one place.</p>
          </div>
          <form
            className="flex flex-wrap items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              setPage(1);
              setSearch(query.trim());
              setRefresh((value) => value + 1);
            }}
          >
            <label className={management.teamSearch}>
              <span className="sr-only">Search {config.label}</span>
              <Search className="size-3.5" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search records..."
              />
            </label>
            <button type="submit" className={management.secondaryButton}>
              Search
            </button>
          </form>
        </div>
        {loading ? (
          <div className="flex justify-center gap-3 p-14 text-sm text-g500">
            <Loader2 className="size-5 animate-spin" />
            Loading records...
          </div>
        ) : error ? (
          <div role="alert" className="p-10 text-center">
            <AlertCircle className="mx-auto mb-3 size-8 text-err" />
            <h3 className="font-semibold text-g800">Records unavailable</h3>
            <p className="my-3 text-sm text-g500">{error}</p>
            <button
              type="button"
              className={management.secondaryButton}
              onClick={() => setRefresh((value) => value + 1)}
            >
              Try again
            </button>
          </div>
        ) : !rows.length ? (
          <div className="p-14 text-center">
            <Icon className="mx-auto mb-4 size-9 text-g300" />
            <h3 className="text-sm font-semibold text-g800">
              No records found
            </h3>
            <p className="mt-2 text-xs text-g500">
              {search
                ? "Try another search or clear the search field."
                : "Records will appear here when they are available."}
            </p>
          </div>
        ) : (
          <div className={management.tableScroll}>
            <table className={management.directory}>
              <thead>
                <tr>
                  {config.columns.map((column) => (
                    <th key={column.label} scope="col">
                      {column.label}
                    </th>
                  ))}
                  <th scope="col">Details</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={String(row.id ?? row.reference ?? row.gtin ?? index)}
                  >
                    {config.columns.map((column) => {
                      const value = read(row, column.paths);
                      return (
                        <td key={column.label} className="max-w-xs break-words">
                          {"money" in column &&
                          column.money &&
                          typeof value === "number"
                            ? money(value)
                            : display(value)}
                        </td>
                      );
                    })}
                    <td>
                      <button
                        type="button"
                        className={management.secondaryButton}
                        onClick={() => open(row)}
                        aria-label={
                          "View record " +
                          String(row.reference ?? row.id ?? index + 1)
                        }
                      >
                        <Eye className="size-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && (
          <div className={management.directoryFooter}>
            <span>
              {rows.length} records on this page
              {total !== null ? " | " + total + " total" : ""}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className={management.secondaryButton}
                disabled={page === 1}
                onClick={() => setPage((value) => value - 1)}
              >
                <ChevronLeft className="size-3" />
                Previous
              </button>
              <span>Page {page}</span>
              <button
                type="button"
                className={management.secondaryButton}
                disabled={total === null || page * 25 >= total}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
                <ChevronRight className="size-3" />
              </button>
            </div>
          </div>
        )}
      </section>
      <dialog
        ref={dialog}
        className={management.recordDialog}
        aria-labelledby="admin-record-details-title"
        onClose={() => setSelected(null)}
      >
        <div className={management.dialogHeader}>
          <div>
            <p className="text-xs text-g500">{config.label}</p>
            <h2
              id="admin-record-details-title"
              className="mt-1 text-lg font-bold"
            >
              Record details
            </h2>
          </div>
          <button
            type="button"
            className={management.secondaryButton}
            onClick={() => dialog.current?.close()}
            aria-label="Close record"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className={management.dialogBody}>
          {selected && (
            <>
              {Array.isArray(selected.images) && (
                <RecordImageGallery
                  key={String(selected.id ?? "record")}
                  images={selected.images}
                />
              )}
              <dl className={management.recordFields}>
                {Object.entries(object(safeDetails(selected)))
                  .filter(
                    ([key]) =>
                      key !== "images" || !Array.isArray(selected.images),
                  )
                  .map(([key, value]) => (
                    <div key={key} className={management.recordField}>
                      <dt className="mb-2 text-xs font-semibold capitalize text-g500">
                        {key
                          .replace(/([a-z])([A-Z])/g, "$1 $2")
                          .replaceAll("_", " ")}
                      </dt>
                      <dd>
                        <DetailValue value={value} />
                      </dd>
                    </div>
                  ))}
              </dl>
            </>
          )}
        </div>
        <footer className={management.dialogFooter}>
          <span className="text-xs text-g500">Saved record details</span>
          <button
            type="button"
            className={management.secondaryButton}
            onClick={() => dialog.current?.close()}
          >
            Close details
          </button>
        </footer>
      </dialog>
    </div>
  );
}
