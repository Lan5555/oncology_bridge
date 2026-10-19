"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import EmptyState from "@/app/components/EmptyState";
import { NETWORK_SERVICE } from "@/app/services/network-service/network-service";
import { unwrapArray } from "@/app/services/response-utils";

export default function NetworkPage() {
  const [network, setNetwork] = useState<any>({
    facilities: [],
    links: [],
    analytics: {},
  });
  const [error, setError] = useState("");
  useEffect(() => {
    void NETWORK_SERVICE.getNetwork().then((response) => {
      if (response.success) setNetwork(response.data ?? {});
      else setError(response.message || "Network could not be loaded.");
    });
  }, []);
  const facilities = unwrapArray(network.facilities);
  const links = unwrapArray(network.links);
  const analytics = network.analytics ?? {};
  const hasCoordinates =
    facilities.length > 1 &&
    facilities.every((facility: any) => {
      const lat = Number(
        facility.latitude ??
          facility.lat ??
          facility.coordinates?.latitude ??
          facility.coordinates?.lat,
      );
      const lng = Number(
        facility.longitude ??
          facility.lng ??
          facility.coordinates?.longitude ??
          facility.coordinates?.lng,
      );
      return Number.isFinite(lat) && Number.isFinite(lng);
    });
  const latitudes = hasCoordinates
    ? facilities.map((facility: any) =>
        Number(
          facility.latitude ??
            facility.lat ??
            facility.coordinates?.latitude ??
            facility.coordinates?.lat,
        ),
      )
    : [];
  const longitudes = hasCoordinates
    ? facilities.map((facility: any) =>
        Number(
          facility.longitude ??
            facility.lng ??
            facility.coordinates?.longitude ??
            facility.coordinates?.lng,
        ),
      )
    : [];
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  const points = facilities.map((facility: any, index: number) => {
    if (hasCoordinates) {
      const lat = Number(
        facility.latitude ??
          facility.lat ??
          facility.coordinates?.latitude ??
          facility.coordinates?.lat,
      );
      const lng = Number(
        facility.longitude ??
          facility.lng ??
          facility.coordinates?.longitude ??
          facility.coordinates?.lng,
      );
      return {
        facility,
        x: 50 + ((lng - minLng) / (maxLng - minLng || 1)) * 700,
        y: 40 + (1 - (lat - minLat) / (maxLat - minLat || 1)) * 360,
      };
    }
    const angle =
      (2 * Math.PI * index) / Math.max(facilities.length, 1) - Math.PI / 2;
    return {
      facility,
      x: 400 + Math.cos(angle) * 285,
      y: 220 + Math.sin(angle) * 145,
    };
  });
  const endpoint = (link: any, side: "source" | "target") =>
    link[side] ??
    link[`${side}Id`] ??
    link[`${side}_id`] ??
    link[side === "source" ? "from" : "to"] ??
    link[`${side}FacilityId`] ??
    link[`${side}_facility_id`];
  const linkEnds = (link: any) => {
    const source = endpoint(link, "source");
    const target = endpoint(link, "target");
    const sourceId = typeof source === "object" ? source?.id : source;
    const targetId = typeof target === "object" ? target?.id : target;
    return [
      points.find((point) => String(point.facility.id) === String(sourceId)),
      points.find((point) => String(point.facility.id) === String(targetId)),
    ] as const;
  };
  return (
    <div className="block animate-fade-up">
      <header className="mb-6 rounded-2xl border border-g200 bg-linear-to-br from-w via-w to-pll p-5 shadow-sm">
        <h1 className="flex items-center gap-2 text-xl font-bold text-g900">
          <MapPin className="size-5 text-p" aria-hidden="true" />
          Network Map
        </h1>
        <p className="mt-1 text-[12.5px] text-g500">
          {facilities.length} facilities · {network.name ?? "Oncology network"}
        </p>
      </header>
      {error ? (
        <p role="status" className="mb-4 text-sm text-err">
          {error}
        </p>
      ) : null}
      <section className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
        {[
          [
            "Average distance",
            analytics.avgDistanceKm == null
              ? "N/A"
              : `${analytics.avgDistanceKm} km`,
          ],
          [
            "Average transit",
            analytics.avgTransitHrs == null
              ? "N/A"
              : `${analytics.avgTransitHrs} hrs`,
          ],
          [
            "Fuel saved",
            analytics.fuelSavedNaira == null
              ? "N/A"
              : new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                  maximumFractionDigits: 0,
                }).format(analytics.fuelSavedNaira),
          ],
        ].map(([label, value]) => (
          <article
            className="rounded-xl border border-g200 bg-w p-5"
            key={label}
          >
            <p className="text-xs uppercase text-g500">{label}</p>
            <p className="mt-2 text-xl font-bold text-g900">{value}</p>
          </article>
        ))}
      </section>
      <section className="mb-5 rounded-xl border border-g200 bg-w p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-[15px] font-bold text-g900">
              Facility network map
            </h2>
            <p className="mt-1 text-xs text-g500">
              {hasCoordinates
                ? "Facility locations and reported network links"
                : "Network topology from the connected facility and link records"}
            </p>
          </div>
          <span className="rounded-full bg-pll px-2.5 py-1 text-[10px] font-semibold text-pd">
            {facilities.length} nodes · {links.length} links
          </span>
        </div>
        {facilities.length ? (
          <div className="overflow-x-auto overflow-y-hidden rounded-xl border border-g200 bg-w shadow-[0_14px_38px_rgba(15,23,42,0.08)]">
            <svg
              className="network-map block h-[380px] w-full min-w-[620px]"
              viewBox="0 0 800 440"
              role="img"
              aria-label="Map of connected oncology facilities and network links"
            >
              <defs>
                <linearGradient
                  id="network-background"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop offset="0%" stopColor="var(--w)" />
                  <stop offset="55%" stopColor="var(--g50)" />
                  <stop offset="100%" stopColor="#eaf5fb" />
                </linearGradient>
                <radialGradient id="network-aura">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.13" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </radialGradient>
                <pattern
                  id="network-grid"
                  width="32"
                  height="32"
                  patternUnits="userSpaceOnUse"
                >
                  <circle
                    cx="2"
                    cy="2"
                    r="1"
                    fill="var(--g300)"
                    fillOpacity="0.48"
                  />
                </pattern>
                <filter
                  id="network-glow"
                  x="-100%"
                  y="-100%"
                  width="300%"
                  height="300%"
                >
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <style>{`@keyframes network-dash { to { stroke-dashoffset: -36; } } .network-link-flow { animation: network-dash 2.8s linear infinite; } @media (prefers-reduced-motion: reduce) { .network-link-flow { animation: none; } .network-flow-dot, .network-node-pulse { display: none; } }`}</style>
              <rect width="800" height="440" fill="url(#network-background)" />
              <ellipse
                cx="400"
                cy="220"
                rx="370"
                ry="205"
                fill="url(#network-aura)"
              />
              <rect width="800" height="440" fill="url(#network-grid)" />
              {links.map((link: any, index: number) => {
                const [from, to] = linkEnds(link);
                if (!from || !to) return null;
                const path = `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
                const duration = `${2.5 + (index % 4) * 0.65}s`;
                return (
                  <g key={link.id ?? index}>
                    <line
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke="#0e7490"
                      strokeOpacity="0.12"
                      strokeWidth="5"
                    />
                    <line
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke={link.status === "PENDING" ? "#d97706" : "#0e7490"}
                      strokeOpacity="0.68"
                      strokeWidth="1.5"
                      strokeDasharray="3 12"
                      className="network-link-flow"
                    />
                    {link.status !== "INACTIVE" ? (
                      <circle
                        r="3.5"
                        fill="#0891b2"
                        filter="url(#network-glow)"
                        className="network-flow-dot"
                      >
                        <animateMotion
                          dur={duration}
                          repeatCount="indefinite"
                          path={path}
                        />
                      </circle>
                    ) : null}
                    {link.status !== "INACTIVE" ? (
                      <circle
                        r="2.2"
                        fill="#0f766e"
                        className="network-flow-dot"
                      >
                        <animateMotion
                          begin="-1.2s"
                          dur={duration}
                          repeatCount="indefinite"
                          path={path}
                        />
                      </circle>
                    ) : null}
                  </g>
                );
              })}
              {points.map(({ facility, x, y }: any) => {
                const alert = Boolean(facility.alert);
                const online = Boolean(
                  facility.online ?? facility.isOnline ?? facility.is_online,
                );
                const color = alert
                  ? "var(--warn)"
                  : online
                    ? "#059669"
                    : "var(--g400)";
                const pulseDuration = `${2.6 + (Number(facility.id?.length ?? 0) % 3) * 0.4}s`;
                return (
                  <g key={facility.id}>
                    <circle
                      cx={x}
                      cy={y}
                      r="12"
                      fill="none"
                      stroke={color}
                      strokeWidth="1.5"
                      opacity="0.42"
                      className="network-node-pulse"
                    >
                      <animate
                        attributeName="r"
                        values="12;25;12"
                        dur={pulseDuration}
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.42;0.04;0.42"
                        dur={pulseDuration}
                        repeatCount="indefinite"
                      />
                    </circle>
                    <circle
                      cx={x}
                      cy={y}
                      r="8"
                      fill="var(--w)"
                      stroke={color}
                      strokeWidth="2.5"
                      filter="url(#network-glow)"
                    >
                      <title>{facility.name ?? "Facility"}</title>
                    </circle>
                    <circle cx={x} cy={y} r="2.8" fill={color} />
                    <text
                      x={x}
                      y={y + 27}
                      textAnchor="middle"
                      fill="var(--g800)"
                      fontSize="11"
                      fontWeight="600"
                    >
                      {String(facility.name ?? "Facility").slice(0, 22)}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-g200 px-4 py-3 text-[10px] font-medium text-g600">
              <span className="inline-flex items-center gap-2">
                <i className="size-2 rounded-full bg-emerald-600 shadow-[0_0_7px_rgba(5,150,105,0.55)]" />
                Online node
              </span>
              <span className="inline-flex items-center gap-2">
                <i className="size-2 rounded-full bg-amber-600 shadow-[0_0_7px_rgba(217,119,6,0.45)]" />
                Alert node / pending route
              </span>
              <span className="ml-auto text-g500">
                Moving pulses show connected routes
              </span>
            </div>
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-g200 p-8 text-center text-sm text-g500">
            Facility coordinates and links will appear here when returned by the
            network API.
          </p>
        )}
      </section>
      <section className="rounded-xl border border-g200 bg-w p-6">
        <h2 className="mb-4 text-[15px] font-bold text-g900">
          Connected facilities
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-3">
          {facilities.map((facility: any) => (
            <article
              className="rounded-lg border border-g200 p-4"
              key={facility.id}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-g800">{facility.name}</h3>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold ${facility.alert ? "bg-warnl text-warn" : facility.online ? "bg-okl text-good" : "bg-g100 text-g500"}`}
                >
                  {facility.alert
                    ? "Alert"
                    : facility.online
                      ? "Online"
                      : "Offline"}
                </span>
              </div>
              <p className="mt-1 text-xs text-g500">
                {facility.type ?? "Facility"} · {facility.city ?? "N/A"}
              </p>
            </article>
          ))}
        </div>
        {!facilities.length ? (
          <EmptyState
            icon={MapPin}
            title="No facilities on the map yet"
            description="Facilities will appear here when they are added to the network."
          />
        ) : null}
      </section>
    </div>
  );
}
