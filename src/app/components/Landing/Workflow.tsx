import Reveal from "./Reveal";
import { EYEBROW, H2_DARK, INNER, P_DARK, SECTION } from "./classes";

const STEPS = [
  {
    num: "01",
    icon: (
      <>
        <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
        <circle cx="12" cy="12" r="2" />
      </>
    ),
    title: "Stock Ingestion & POS Sync",
    body: "A new shipment arrives. The pharmacist logs it into their POS system. A background webhook instantly pushes the update, batch numbers, quantities, expiry dates, into the network ledger.",
  },
  {
    num: "02",
    icon: (
      <>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <line x1="12" y1="11" x2="12" y2="17" />
        <line x1="9" y1="14" x2="15" y2="14" />
      </>
    ),
    title: "Structured Prescription",
    body: "The oncologist selects an ICD-10 code, TNM stage, and insurer. The platform packages this into a Unified Clinical Object and filters available drugs to those covered under the patient's HMO tariff.",
  },
  {
    num: "03",
    icon: (
      <>
        <polyline points="17,1 21,5 17,9" />
        <path d="M3 11V9a4 4 0 014-4h14" />
      </>
    ),
    title: "Order Match & Reserve",
    body: "The platform matches the prescription to the closest verified pharmacy with the correct drug in stock. The pharmacist accepts, and those exact vials are immediately deducted from the live network inventory.",
  },
  {
    num: "04",
    icon: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </>
    ),
    title: "Prior-Authorization Loop",
    body: "The Adapter Layer routes the clinical JSON to the HMO via API (modern), portal auto-fill (legacy), or a WAOAB-sealed PDF with an anti-fraud QR code (paper-based), then drops the claims code into the pharmacy dashboard.",
  },
  {
    num: "05",
    icon: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <path d="M7 2v20M2 12h5M7 7h14M7 17h14" />
      </>
    ),
    title: "GS1 Validation Scan",
    body: 'Payment clears. A cold-chain courier is dispatched. The pharmacist scans the GS1 DataMatrix, the backend instantly confirms the batch is authentic, unrecalled, and unexpired. Dashboard turns green: "WAOAB Clean-Stock Cleared."',
  },
  {
    num: "06",
    icon: (
      <>
        <path d="M22 2L11 13" />
        <path d="M22 2L15 22l-4-9-9-4 20-7z" />
      </>
    ),
    title: "Last-Mile Delivery",
    body: "The courier delivers directly to the oncology treatment room in a temperature-monitored cold-chain bag. The nurse scans a delivery QR code, confirming arrival within the safety window. Dose administered. Case closed.",
  },
];

export default function Workflow() {
  return (
    <section className={SECTION} id="workflow">
      <div className={INNER}>
        <div className="max-w-[560px]">
          <div className={EYEBROW}>How It Works</div>
          <h2 className={H2_DARK}>
            From pharmacy shelf to treatment chair, verified every step.
          </h2>
          <p className={P_DARK}>
            Six integrated stages ensure a vial&rsquo;s journey is tracked,
            authenticated, and cold-chain-secured before it reaches a patient.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
          {STEPS.map((s, i) => (
            <Reveal
              className="relative translate-y-6 overflow-hidden rounded-[14px] border border-[#E2E8F0] bg-white p-7 transition-[opacity,translate,box-shadow] duration-500 before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-linear-135 before:from-sky before:to-cyan before:content-[''] hover:-translate-y-[3px]! hover:shadow-[0_12px_40px_rgba(14,165,233,0.12)]"
              key={s.num}
              delayMs={i * 80}
            >
              <div className="absolute top-4 right-5 font-display text-[2.5rem] leading-none font-extrabold tracking-[-2px] text-sky/12">
                {s.num}
              </div>
              <div className="mb-4 flex size-[38px] items-center justify-center rounded-[9px] bg-offwhite">
                <svg
                  viewBox="0 0 24 24"
                  className="size-[18px] fill-none stroke-sky stroke-2"
                >
                  {s.icon}
                </svg>
              </div>
              <div className="mb-1.5 font-display text-sm font-bold text-navy">
                {s.title}
              </div>
              <div className="text-[13px] leading-[1.65] text-slate-2">
                {s.body}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
