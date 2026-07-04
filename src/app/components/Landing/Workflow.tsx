import Reveal from './Reveal';
import styles from  '@/app/pages/landing/landing.module.css';

const STEPS = [
  {
    num: '01',
    icon: <><path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" /><circle cx="12" cy="12" r="2" /></>,
    title: 'Stock Ingestion & POS Sync',
    body: 'A new shipment arrives. The pharmacist logs it into their POS system. A background webhook instantly pushes the update — batch numbers, quantities, expiry dates — into the network ledger.',
  },
  {
    num: '02',
    icon: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" /></>,
    title: 'Structured Prescription',
    body: "The oncologist selects an ICD-10 code, TNM stage, and insurer. The platform packages this into a Unified Clinical Object and filters available drugs to those covered under the patient's HMO tariff.",
  },
  {
    num: '03',
    icon: <><polyline points="17,1 21,5 17,9" /><path d="M3 11V9a4 4 0 014-4h14" /></>,
    title: 'Order Match & Reserve',
    body: 'The platform matches the prescription to the closest verified pharmacy with the correct drug in stock. The pharmacist accepts, and those exact vials are immediately deducted from the live network inventory.',
  },
  {
    num: '04',
    icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>,
    title: 'Prior-Authorization Loop',
    body: 'The Adapter Layer routes the clinical JSON to the HMO via API (modern), portal auto-fill (legacy), or a WAOAB-sealed PDF with an anti-fraud QR code (paper-based) — then drops the claims code into the pharmacy dashboard.',
  },
  {
    num: '05',
    icon: <><rect x="2" y="2" width="20" height="20" rx="2" /><path d="M7 2v20M2 12h5M7 7h14M7 17h14" /></>,
    title: 'GS1 Validation Scan',
    body: 'Payment clears. A cold-chain courier is dispatched. The pharmacist scans the GS1 DataMatrix — the backend instantly confirms the batch is authentic, unrecalled, and unexpired. Dashboard turns green: "WAOAB Clean-Stock Cleared."',
  },
  {
    num: '06',
    icon: <><path d="M22 2L11 13" /><path d="M22 2L15 22l-4-9-9-4 20-7z" /></>,
    title: 'Last-Mile Delivery',
    body: 'The courier delivers directly to the oncology treatment room in a temperature-monitored cold-chain bag. The nurse scans a delivery QR code — confirming arrival within the safety window. Dose administered. Case closed.',
  },
];

export default function Workflow() {
  return (
    <section className={"px-5 py-20 md:px-10 md:py-24"} id="workflow">
      <div className={"mx-auto max-w-[1100px]"}>
        <div style={{ maxWidth: '560px', marginBottom: 0 }}>
          <div className={"mb-4 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[1.2px] text-sky-500 before:h-0.5 before:w-5 before:rounded-full before:bg-gradient-to-r before:from-sky-500 before:to-cyan-500 before:content-[\"\"]"}>How It Works</div>
          <h2 className={"mb-4 text-[clamp(1.8rem,3.5vw,2.8rem)] font-extrabold leading-[1.15] text-[#050e1f] [font-family:'Plus_Jakarta_Sans',sans-serif]"}>From pharmacy shelf to treatment chair — verified every step.</h2>
          <p className={"max-w-[560px] text-base leading-8 text-slate-500"}>
            Six integrated stages ensure a vial&rsquo;s journey is tracked, authenticated, and
            cold-chain-secured before it reaches a patient.
          </p>
        </div>

        <div className={"mt-12 grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6"}>
          {STEPS.map((s, i) => (
            <Reveal className={"relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 transition duration-500 before:absolute before:left-0 before:right-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-sky-500 before:to-cyan-500 before:content-[\"\"] hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10"} key={s.num} delayMs={i * 80}>
              <div className={"absolute right-5 top-4 text-4xl font-extrabold text-sky-500/10 [font-family:'Plus_Jakarta_Sans',sans-serif]"}>{s.num}</div>
              <div className={"mb-4 flex h-[38px] w-[38px] items-center justify-center rounded-[9px] bg-sky-50 text-sky-500 [&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2"}><svg viewBox="0 0 24 24">{s.icon}</svg></div>
              <div className={"mb-1.5 text-sm font-bold text-[#050e1f] [font-family:'Plus_Jakarta_Sans',sans-serif]"}>{s.title}</div>
              <div className={"text-[13px] leading-7 text-slate-500"}>{s.body}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
