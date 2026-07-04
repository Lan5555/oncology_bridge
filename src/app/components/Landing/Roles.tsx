import Reveal from './Reveal';

const CHECK = <svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12" /></svg>;

const ROLES = [
  {
    letter: 'A',
    title: 'Submitting Pharmacist',
    sub: 'Donor Hub',
    body: 'Operating at facilities with surplus or near-expiry stock. The first point of truth in the verification chain.',
    perms: [
      'Scan GS1 barcodes and log inventory',
      'Flag batches as available for redistribution',
      "View own facility's live stock levels",
    ],
  },
  {
    letter: 'B',
    title: 'Requesting Pharmacist',
    sub: 'Recipient Hub',
    body: 'Operating at facilities facing shortages. Connected to the regional availability map in real time.',
    perms: [
      'View regional drug availability',
      'Log stock-out alerts by GTIN',
      'Initiate transfer requests',
    ],
  },
  {
    letter: 'C',
    title: 'Network Admin',
    sub: 'Medical Liaison',
    body: 'Central authority managing system governance and clinical advocacy across the entire corridor network.',
    perms: [
      'Verify facility credentials and IP whitelists',
      'Approve and mediate transfer routing',
      'Full immutable audit log access',
    ],
  },
];

export default function Roles() {
  return (
    <section className={"bg-[#0a1628] px-5 py-20 md:px-10 md:py-24"} id="roles">
      <div className={"mx-auto max-w-[1100px]"}>
        <div style={{ maxWidth: '560px' }}>
          <div className={"mb-4 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[1.2px] text-sky-500 before:h-0.5 before:w-5 before:rounded-full before:bg-gradient-to-r before:from-sky-500 before:to-cyan-500 before:content-[\"\"]"}>Role-Based Access</div>
          <h2 className={"mb-4 text-[clamp(1.8rem,3.5vw,2.8rem)] font-extrabold leading-[1.15] text-[#050e1f] [font-family:'Plus_Jakarta_Sans',sans-serif]" + ' ' + "text-white"}>Built for every member of the oncology supply chain.</h2>
          <p className={"max-w-[560px] text-base leading-8 text-slate-500" + ' ' + "text-white"}>
            Three distinct roles with strict RBAC — each person sees exactly what they need,
            nothing more.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '3rem', marginBottom: '3rem' }}>
          <div className={"overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-slate-950/20 [&_img]:transition [&_img]:duration-500 hover:[&_img]:scale-105"} style={{ height: '260px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800"
              alt="Collaboration"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div className={"overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-slate-950/20 [&_img]:transition [&_img]:duration-500 hover:[&_img]:scale-105"} style={{ height: '260px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1642055514517-7b52288890ec?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cGhhcm1hY3l8ZW58MHx8MHx8fDA%3D"
              alt="Pharmacy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>

        <div className={"mt-12 grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6"}>
          {ROLES.map((r, i) => (
            <Reveal className={"rounded-2xl border border-white/10 bg-white/5 p-8 transition duration-500 hover:-translate-y-0.5 hover:border-sky-400/30"} key={r.letter} delayMs={i * 100}>
              <div className={"mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 text-base font-extrabold text-white [font-family:'Plus_Jakarta_Sans',sans-serif]"}>{r.letter}</div>
              <div className={"mb-2 text-[15px] font-bold text-white [font-family:'Plus_Jakarta_Sans',sans-serif]"}>{r.title}</div>
              <div className={"mb-3 text-xs font-semibold uppercase tracking-[0.5px] text-cyan-400"}>{r.sub}</div>
              <div className={"text-[13.5px] leading-7 text-white/45"}>{r.body}</div>
              <div className={"mt-4 flex flex-col gap-1.5"}>
                {r.perms.map((p) => (
                  <div className={"flex items-center gap-2 text-[12.5px] text-white/55 [&_svg]:h-[13px] [&_svg]:w-[13px] [&_svg]:shrink-0 [&_svg]:fill-none [&_svg]:stroke-emerald-500 [&_svg]:stroke-[2.5]"} key={p}>{CHECK}{p}</div>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
