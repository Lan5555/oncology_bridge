import Reveal from './Reveal';
const REGS = [
  {
    tone: 'blue',
    icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    title: 'NAFDAC Maturity Level 4',
    body: "Nigeria's shift to full traceability makes digital inventory tracking a regulatory requirement. Oncology Bridge is the user-friendly front-end for NAFDAC compliance.",
  },
  {
    tone: 'green',
    icon: <><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22,4 12,14.01 9,11.01" /></>,
    title: 'NHIA Subsidies Expanding',
    body: 'New National Health Insurance Authority subsidies are rapidly increasing oncology patient volume — making stock-out prevention critical for facility operations and financial sustainability.',
  },
  {
    tone: 'amber',
    icon: <><polyline points="23,6 13.5,15.5 8.5,10.5 1,18" /><polyline points="17,6 23,6 23,12" /></>,
    title: '30%+ Health Inflation',
    body: "With health inflation exceeding 30%, facilities can no longer absorb the financial loss from drug wastage. Redistribution is no longer just ethical — it's economically essential.",
  },
  {
    tone: 'blue',
    icon: <><rect x="2" y="2" width="20" height="20" rx="2" /><path d="M7 2v20M2 12h5M7 7h14M7 17h14" /></>,
    title: 'GS1 Global Standards',
    body: "Our GS1 DataMatrix integration aligns with international pharmaceutical serialization standards — future-proofing the platform as Nigeria's drug traceability regulation matures.",
  },
];

const toneClasses: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-500',
  green: 'bg-emerald-50 text-emerald-500',
  amber: 'bg-amber-50 text-amber-500',
};

export default function Regulatory() {
  return (
    <section className={"px-5 py-20 md:px-10 md:py-24" + ' ' + "bg-white"} id="regulatory">
      <div className={"mx-auto max-w-[1100px]"}>
        <div style={{ textAlign: 'center', maxWidth: '560px', margin: '0 auto 3rem' }}>
          <div className={"mb-4 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[1.2px] text-sky-500 before:h-0.5 before:w-5 before:rounded-full before:bg-gradient-to-r before:from-sky-500 before:to-cyan-500 before:content-[\"\"]"} style={{ justifyContent: 'center' }}>2026 Regulatory Tailwinds</div>
          <h2 className={"mb-4 text-[clamp(1.8rem,3.5vw,2.8rem)] font-extrabold leading-[1.15] text-[#050e1f] [font-family:'Plus_Jakarta_Sans',sans-serif]"} style={{ textAlign: 'center' }}>Built for the regulatory moment Nigeria is entering.</h2>
          <p className={"max-w-[560px] text-base leading-8 text-slate-500"} style={{ margin: '0 auto', textAlign: 'center' }}>
            Three converging forces make this the right platform at the right time.
          </p>
        </div>
        <div className={"mt-12 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6"}>
          {REGS.map((r) => (
            <Reveal className={"flex items-start gap-3.5 rounded-xl border border-slate-200 p-6 transition duration-500 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-500/10"} key={r.title}>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] [&_svg]:h-5 [&_svg]:w-5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2 ${toneClasses[r.tone]}`}><svg viewBox="0 0 24 24">{r.icon}</svg></div>
              <div>
                <div className={"mb-1 text-sm font-bold text-[#050e1f] [font-family:'Plus_Jakarta_Sans',sans-serif]"}>{r.title}</div>
                <div className={"text-[13px] leading-7 text-slate-500"}>{r.body}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
