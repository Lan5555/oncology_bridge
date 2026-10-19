import Reveal from "./Reveal";
import { EYEBROW, H2_DARK, INNER, P_DARK, SECTION } from "./classes";

const TONES: Record<string, { bg: string; stroke: string }> = {
  blue: { bg: "bg-[#EFF6FF]", stroke: "stroke-[#3B82F6]" },
  green: { bg: "bg-[#ecfdf5]", stroke: "stroke-ok" },
  amber: { bg: "bg-[#FFFBEB]", stroke: "stroke-warn" },
};
const REGS = [
  {
    tone: "blue",
    icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    title: "NAFDAC Maturity Level 4",
    body: "Nigeria's shift to full traceability makes digital inventory tracking a regulatory requirement. Oncosourz is the user-friendly front-end for NAFDAC compliance.",
  },
  {
    tone: "green",
    icon: (
      <>
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22,4 12,14.01 9,11.01" />
      </>
    ),
    title: "NHIA Subsidies Expanding",
    body: "New National Health Insurance Authority subsidies are rapidly increasing oncology patient volume, making stock-out prevention critical for facility operations and financial sustainability.",
  },
  {
    tone: "amber",
    icon: (
      <>
        <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" />
        <polyline points="17,6 23,6 23,12" />
      </>
    ),
    title: "30%+ Health Inflation",
    body: "With health inflation exceeding 30%, facilities can no longer absorb the financial loss from drug wastage. Redistribution is no longer just ethical, it's economically essential.",
  },
  {
    tone: "blue",
    icon: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <path d="M7 2v20M2 12h5M7 7h14M7 17h14" />
      </>
    ),
    title: "GS1 Global Standards",
    body: "Our GS1 DataMatrix integration aligns with international pharmaceutical serialization standards, future-proofing the platform as Nigeria's drug traceability regulation matures.",
  },
];

export default function Regulatory() {
  return (
    <section className={`${SECTION} bg-white`} id="regulatory">
      <div className={INNER}>
        <div className="mx-auto mb-12 max-w-[560px] text-center">
          <div className={`${EYEBROW} justify-center`}>
            2026 Regulatory Tailwinds
          </div>
          <h2 className={`${H2_DARK} text-center`}>
            Built for the regulatory moment Nigeria is entering.
          </h2>
          <p className={`${P_DARK} mx-auto text-center`}>
            Three converging forces make this the right platform at the right
            time.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
          {REGS.map((r) => (
            <Reveal
              className="flex translate-y-4 items-start gap-3.5 rounded-xl border border-[#E2E8F0] p-6 transition-[opacity,translate,box-shadow] duration-500 hover:border-sky-light hover:shadow-[0_6px_24px_rgba(14,165,233,0.1)]"
              key={r.title}
            >
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-[10px] ${TONES[r.tone].bg}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className={`size-5 fill-none stroke-2 ${TONES[r.tone].stroke}`}
                >
                  {r.icon}
                </svg>
              </div>
              <div>
                <div className="mb-1 font-display text-sm font-bold text-navy">
                  {r.title}
                </div>
                <div className="text-[13px] leading-[1.6] text-slate-2">
                  {r.body}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
