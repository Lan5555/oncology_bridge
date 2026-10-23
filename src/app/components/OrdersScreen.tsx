"use client";

import { Package, RefreshCw, ShoppingBag, Truck } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { useDashboardRefresh } from "../hooks/useDashboardRefresh";
import {
  ORDER_SERVICE,
  ORDER_STATUSES,
  type OrderDetail,
  type OrderPage,
  type OrderStatus,
  PAYMENT_STATUSES,
} from "../services/order-service/order-service";
import styles from "./OrdersScreen.module.css";

function label(value: string | null | undefined) {
  return value
    ? value
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/^./, (c) => c.toUpperCase())
    : "Unavailable";
}
function date(value: string | null | undefined) {
  if (!value || Number.isNaN(Date.parse(value))) return "Unavailable";
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
function money(value: number | null, currency: string | null) {
  if (typeof value !== "number" || !Number.isFinite(value) || !currency)
    return "Unavailable";
  try {
    const formatter = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    });
    const digits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
    return formatter.format(value / 10 ** digits);
  } catch {
    return "Unavailable";
  }
}
function Badge({ value }: { value: string }) {
  return (
    <span className={styles.badge} data-status={value}>
      {label(value)}
    </span>
  );
}

export default function OrdersScreen({
  admin = false,
  onShop,
  onMonitor,
}: {
  admin?: boolean;
  onShop?: () => void;
  onMonitor?: () => void;
}) {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<OrderPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [nextStatus, setNextStatus] = useState("");
  const [note, setNote] = useState("");
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [notice, setNotice] = useState("");
  const saveLock = useRef(false);
  const detailSection = useRef<HTMLElement>(null);
  const { refresh, refreshVersion } = useDashboardRefresh(
    !saving && !nextStatus && !note && !carrier && !trackingNumber,
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshVersion intentionally triggers manual and periodic reloads.
  useEffect(() => {
    let current = true;
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (query) params.set("q", query);
    if (status) params.set("status", status);
    if (paymentStatus) params.set("paymentStatus", paymentStatus);
    async function load() {
      try {
        const response = await ORDER_SERVICE.list(params, admin);
        if (!current) return;
        if (!response.success)
          throw new Error(response.message || "Orders could not be loaded.");
        const data = response.data as OrderPage;
        if (
          !Array.isArray(data?.items) ||
          !data.pagination ||
          !Number.isInteger(data.pagination.total) ||
          !Number.isInteger(data.pagination.totalPages)
        )
          throw new Error("Orders are unavailable. Please try again.");
        setResult(data);
      } catch (err) {
        if (current) {
          setResult(null);
          setError(
            err instanceof Error ? err.message : "Orders could not be loaded.",
          );
        }
      } finally {
        if (current) setLoading(false);
      }
    }
    void load();
    return () => {
      current = false;
    };
  }, [admin, page, query, status, paymentStatus, refreshVersion]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshVersion intentionally reloads the selected order after mutations and polling.
  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let current = true;
    setDetailLoading(true);
    setDetailError("");
    setDetail(null);
    setNextStatus("");
    setNote("");
    setCarrier("");
    setTrackingNumber("");
    async function load() {
      try {
        const response = await ORDER_SERVICE.detail(
          selectedId as string,
          admin,
        );
        if (!current) return;
        if (!response.success)
          throw new Error(
            response.message || "Order details could not be loaded.",
          );
        const data = response.data as OrderDetail;
        if (
          data?.id !== selectedId ||
          !Array.isArray(data.items) ||
          !Array.isArray(data.timeline)
        )
          throw new Error("Order details are unavailable.");
        setDetail(data);
      } catch (err) {
        if (current)
          setDetailError(
            err instanceof Error
              ? err.message
              : "Order details could not be loaded.",
          );
      } finally {
        if (current) setDetailLoading(false);
      }
    }
    void load();
    return () => {
      current = false;
    };
  }, [admin, selectedId, refreshVersion]);

  const transitions = (detail?.allowedTransitions ?? []).filter((value) =>
    ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].includes(value),
  );

  async function updateOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !detail ||
      saveLock.current ||
      !transitions.includes(nextStatus as OrderStatus) ||
      !note.trim()
    )
      return;
    if (nextStatus === "SHIPPED" && (!carrier.trim() || !trackingNumber.trim()))
      return;
    saveLock.current = true;
    setSaving(true);
    setSaveError("");
    setNotice("");
    try {
      const response = await ORDER_SERVICE.updateFulfillment(detail.id, {
        status: nextStatus as OrderStatus,
        expectedVersion: detail.version,
        note: note.trim(),
        ...(nextStatus === "SHIPPED"
          ? { carrier: carrier.trim(), trackingNumber: trackingNumber.trim() }
          : {}),
      });
      if (!response.success) {
        if (response.status === 409) {
          refresh();
          throw new Error(
            "This order changed. Review its latest details before updating again.",
          );
        }
        throw new Error(response.message || "The order could not be updated.");
      }
      setNotice("Order updated. The latest tracking details are being loaded.");
      refresh();
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "The order could not be updated.",
      );
    } finally {
      saveLock.current = false;
      setSaving(false);
    }
  }

  function chooseOrder(id: string) {
    setSelectedId(id);
    setSaveError("");
    setNotice("");
    requestAnimationFrame(() =>
      detailSection.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      }),
    );
  }

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>
            {admin ? "Network / Order management" : "Marketplace / Purchases"}
          </p>
          <h1>{admin ? "Orders" : "Your orders"}</h1>
          <p className={styles.muted}>
            {admin
              ? "Monitor purchases, payments and fulfillment across the network."
              : "Follow your purchases from checkout to delivery."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {onMonitor && (
            <button type="button" className={styles.button} onClick={onMonitor}>
              <Truck size={15} /> Shipment temperatures
            </button>
          )}
          {onShop && (
            <button type="button" className={styles.button} onClick={onShop}>
              <ShoppingBag size={15} /> Browse marketplace
            </button>
          )}
          <button
            type="button"
            className={styles.button}
            disabled={loading || saving}
            onClick={refresh}
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </header>

      <section
        className={styles.panel}
        aria-label="Order list"
        aria-busy={loading}
      >
        <form
          className={styles.toolbar}
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setQuery(search.trim());
          }}
        >
          <label>
            Search orders
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                admin
                  ? "Order reference, medicine or buyer"
                  : "Order reference or medicine"
              }
              type="search"
            />
          </label>
          <label>
            Order status
            <select
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
            >
              <option value="">All statuses</option>
              {ORDER_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {label(value)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Payment
            <select
              value={paymentStatus}
              onChange={(e) => {
                setPage(1);
                setPaymentStatus(e.target.value);
              }}
            >
              <option value="">All payments</option>
              {PAYMENT_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {label(value)}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className={`${styles.button} ${styles.primary}`}
          >
            Search
          </button>
        </form>
        {loading ? (
          <output className={styles.empty}>Loading orders…</output>
        ) : error ? (
          <div className={styles.empty}>
            <p role="alert" className={styles.error}>
              {error}
            </p>
            <button type="button" className={styles.button} onClick={refresh}>
              Try again
            </button>
          </div>
        ) : result?.items.length ? (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Order</th>
                    {admin && <th scope="col">Buyer</th>}
                    <th scope="col">Seller</th>
                    <th scope="col">Total</th>
                    <th scope="col">Payment</th>
                    <th scope="col">Fulfillment</th>
                    <th scope="col">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>
                          {order.reference || "Reference unavailable"}
                        </strong>
                        <p className={styles.muted}>{date(order.createdAt)}</p>
                        <p className={styles.muted}>
                          {order.itemCount} item
                          {order.itemCount === 1 ? "" : "s"}
                        </p>
                      </td>
                      {admin && (
                        <td>
                          <strong>{order.buyer?.name || "Unavailable"}</strong>
                          <p className={styles.muted}>
                            {order.buyer?.facilityName}
                          </p>
                        </td>
                      )}
                      <td>{order.seller?.name || "Unavailable"}</td>
                      <td>{money(order.totalMinor, order.currency)}</td>
                      <td>
                        <Badge value={order.paymentStatus} />
                      </td>
                      <td>
                        <Badge value={order.status} />
                      </td>
                      <td>
                        <button
                          type="button"
                          className={styles.button}
                          aria-label={`Track order ${order.reference}`}
                          aria-expanded={selectedId === order.id}
                          disabled={saving}
                          onClick={() => chooseOrder(order.id)}
                        >
                          Track order
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <footer className={styles.pagination}>
              <p className={styles.muted}>
                {result.pagination.total} order
                {result.pagination.total === 1 ? "" : "s"} found
              </p>
              <div>
                <button
                  type="button"
                  className={styles.button}
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </button>
                <span className={styles.muted}>
                  Page {page} of {result.pagination.totalPages}
                </span>
                <button
                  type="button"
                  className={styles.button}
                  disabled={page >= result.pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </footer>
          </>
        ) : (
          <div className={styles.empty}>
            <Package size={32} aria-hidden="true" />
            <h2>No orders found</h2>
            <p className={styles.muted}>
              {query || status || paymentStatus
                ? "Try another search or clear your filters."
                : admin
                  ? "Purchases will appear here when customers check out."
                  : "Your marketplace purchases will appear here after checkout."}
            </p>
            {(query || status || paymentStatus) && (
              <button
                type="button"
                className={styles.button}
                onClick={() => {
                  setSearch("");
                  setQuery("");
                  setStatus("");
                  setPaymentStatus("");
                  setPage(1);
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </section>

      {selectedId && (
        <section
          ref={detailSection}
          className={`${styles.panel} ${styles.detail}`}
          aria-label="Order tracking"
          aria-busy={detailLoading}
        >
          <div className={styles.detailHeading}>
            <h2>
              Order tracking{detail?.reference ? ` · ${detail.reference}` : ""}
            </h2>
            <button
              type="button"
              className={styles.button}
              disabled={saving}
              onClick={() => setSelectedId(null)}
            >
              Close details
            </button>
          </div>
          {detailLoading ? (
            <output className={styles.empty}>Loading order details…</output>
          ) : detailError ? (
            <div className={styles.empty}>
              <p className={styles.error} role="alert">
                {detailError}
              </p>
              <button type="button" className={styles.button} onClick={refresh}>
                Try again
              </button>
            </div>
          ) : (
            detail && (
              <div className={styles.detailsGrid}>
                <div className={styles.stack}>
                  <section>
                    <h3>Purchased items</h3>
                    <div className={styles.tableWrap}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th scope="col">Medicine</th>
                            <th scope="col">Quantity</th>
                            <th scope="col">Unit price</th>
                            <th scope="col">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detail.items.map((item) => (
                            <tr key={item.id}>
                              <td>
                                <strong>{item.name || "Unavailable"}</strong>
                                <span className={styles.muted}>
                                  {item.strength}
                                </span>
                              </td>
                              <td>
                                {item.quantity} {item.unit}
                              </td>
                              <td>
                                {money(item.unitPriceMinor, detail.currency)}
                              </td>
                              <td>{money(item.totalMinor, detail.currency)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                  <section>
                    <h3>Tracking history</h3>
                    {detail.timeline.length ? (
                      <ol className={styles.timeline}>
                        {detail.timeline.map((event) => (
                          <li key={event.id}>
                            <strong>{label(event.status)}</strong>
                            <p>{event.message}</p>
                            <time
                              className={styles.muted}
                              dateTime={event.occurredAt}
                            >
                              {date(event.occurredAt)}
                            </time>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className={styles.muted}>
                        No tracking events available yet.
                      </p>
                    )}
                  </section>
                  {admin && transitions.length > 0 && (
                    <form className={styles.form} onSubmit={updateOrder}>
                      <h3>Update fulfillment</h3>
                      <p className={styles.muted}>
                        Confirm the actual fulfillment state. Your note will be
                        visible in the customer’s order history.
                      </p>
                      <label>
                        Next status
                        <select
                          required
                          value={nextStatus}
                          disabled={saving}
                          onChange={(e) => setNextStatus(e.target.value)}
                        >
                          <option value="">Choose a status</option>
                          {transitions.map((value) => (
                            <option value={value} key={value}>
                              {label(value)}
                            </option>
                          ))}
                        </select>
                      </label>
                      {nextStatus === "SHIPPED" && (
                        <>
                          <label>
                            Carrier
                            <input
                              required
                              maxLength={120}
                              value={carrier}
                              disabled={saving}
                              onChange={(e) => setCarrier(e.target.value)}
                            />
                          </label>
                          <label>
                            Tracking number
                            <input
                              required
                              maxLength={120}
                              value={trackingNumber}
                              disabled={saving}
                              onChange={(e) =>
                                setTrackingNumber(e.target.value)
                              }
                            />
                          </label>
                        </>
                      )}
                      <label>
                        Customer-visible note
                        <textarea
                          required
                          maxLength={1000}
                          rows={3}
                          value={note}
                          disabled={saving}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Explain this order update"
                        />
                      </label>
                      <button
                        type="submit"
                        className={`${styles.button} ${styles.primary}`}
                        disabled={
                          saving ||
                          !nextStatus ||
                          !note.trim() ||
                          (nextStatus === "SHIPPED" &&
                            (!carrier.trim() || !trackingNumber.trim()))
                        }
                      >
                        {saving
                          ? "Saving…"
                          : `Confirm ${nextStatus ? label(nextStatus).toLowerCase() : "update"}`}
                      </button>
                    </form>
                  )}
                  {saveError && (
                    <p className={styles.error} role="alert">
                      {saveError}
                    </p>
                  )}
                  {notice && (
                    <output className={styles.notice}>{notice}</output>
                  )}
                </div>
                <aside className={styles.stack}>
                  <section>
                    <h3>Order summary</h3>
                    <dl className={styles.facts}>
                      <div>
                        <dt>Fulfillment</dt>
                        <dd>
                          <Badge value={detail.status} />
                        </dd>
                      </div>
                      <div>
                        <dt>Payment</dt>
                        <dd>
                          <Badge value={detail.paymentStatus} />
                        </dd>
                      </div>
                      <div>
                        <dt>Seller</dt>
                        <dd>{detail.seller?.name || "Unavailable"}</dd>
                      </div>
                      {admin && (
                        <div>
                          <dt>Buyer</dt>
                          <dd>{detail.buyer?.name || "Unavailable"}</dd>
                        </div>
                      )}
                      <div>
                        <dt>Subtotal</dt>
                        <dd>{money(detail.subtotalMinor, detail.currency)}</dd>
                      </div>
                      <div>
                        <dt>Delivery fee</dt>
                        <dd>
                          {money(detail.deliveryFeeMinor, detail.currency)}
                        </dd>
                      </div>
                      <div>
                        <dt>Total</dt>
                        <dd>
                          <strong>
                            {money(detail.totalMinor, detail.currency)}
                          </strong>
                        </dd>
                      </div>
                      <div>
                        <dt>Payment reference</dt>
                        <dd>{detail.paymentReference || "Unavailable"}</dd>
                      </div>
                      <div>
                        <dt>Paid at</dt>
                        <dd>{date(detail.paidAt)}</dd>
                      </div>
                    </dl>
                  </section>
                  <section>
                    <h3 className="flex items-center gap-2">
                      <Truck size={16} /> Delivery
                    </h3>
                    <dl className={styles.facts}>
                      <div>
                        <dt>Recipient</dt>
                        <dd>
                          {detail.delivery?.recipientName || "Unavailable"}
                        </dd>
                      </div>
                      <div>
                        <dt>Address</dt>
                        <dd>{detail.delivery?.address || "Unavailable"}</dd>
                      </div>
                      <div>
                        <dt>Carrier</dt>
                        <dd>{detail.delivery?.carrier || "Unavailable"}</dd>
                      </div>
                      <div>
                        <dt>Tracking number</dt>
                        <dd>
                          {detail.delivery?.trackingNumber || "Unavailable"}
                        </dd>
                      </div>
                      <div>
                        <dt>Estimated arrival</dt>
                        <dd>{date(detail.delivery?.estimatedDeliveryAt)}</dd>
                      </div>
                      <div>
                        <dt>Delivered at</dt>
                        <dd>{date(detail.delivery?.deliveredAt)}</dd>
                      </div>
                    </dl>
                  </section>
                  <p className={styles.muted}>
                    Last updated {date(detail.updatedAt)}. Tracking refreshes
                    automatically while this screen is open.
                  </p>
                </aside>
              </div>
            )
          )}
        </section>
      )}
    </div>
  );
}
