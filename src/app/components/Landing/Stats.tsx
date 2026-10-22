"use client";

import { useEffect, useState } from "react";
import { DASHBOARD_SERVICE } from "@/app/services/dashboard-service/dashboard-service";
import Counter from "./Counter";
import Reveal from "./Reveal";

export default function Stats() {
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let current = true;
    void DASHBOARD_SERVICE.publicStats().then((response) => {
      if (!current) return;
      if (response.success) setStats(response.data ?? {});
      else setError("Platform statistics are unavailable.");
      setLoading(false);
    });
    return () => {
      current = false;
    };
  }, []);
  const metrics = [
    { key: "stockOutRiskPct", label: "Medicines out of stock (%)" },
    { key: "valueRecoveredNaira", label: "Reported value recovered (NGN)" },
    { key: "nodes", label: "Active facilities" },
    { key: "gs1AuthenticatedVials", label: "GS1 authenticated vials" },
  ];
  return (
    <section
      className="bg-navy-2 px-10 py-20 text-white"
      aria-label="Platform statistics"
      aria-busy={loading}
    >
      {error && <p role="alert">{error}</p>}
      <div className="mx-auto grid max-w-[1100px] grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        {metrics.map(({ key, label }) => {
          const value = stats[key];
          return (
            <Reveal key={key} className="p-8 text-center">
              <div className="mb-2 text-3xl font-bold">
                {loading ? (
                  "Loading?"
                ) : typeof value === "number" && Number.isFinite(value) ? (
                  <Counter target={value} />
                ) : (
                  "Not available"
                )}
              </div>
              <div className="text-sm text-white/60">{label}</div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
