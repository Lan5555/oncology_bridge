import Reveal from "./Reveal";
import { EYEBROW, H2_LIGHT, IMG, IMG_FRAME, INNER, P_LIGHT } from "./classes";

const CHECK = (
  <svg
    viewBox="0 0 24 24"
    className="size-[13px] shrink-0 fill-none stroke-ok stroke-[2.5]"
  >
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

const ROLES = [
  {
    letter: "A",
    title: "Submitting Pharmacist",
    sub: "Donor Hub",
    body: "Operating at facilities with surplus or near-expiry stock. The first point of truth in the verification chain.",
    perms: [
      "Scan GS1 barcodes and log inventory",
      "Flag batches as available for redistribution",
      "View own facility's live stock levels",
    ],
  },
  {
    letter: "B",
    title: "Requesting Pharmacist",
    sub: "Recipient Hub",
    body: "Operating at facilities facing shortages. Connected to the regional availability map in real time.",
    perms: [
      "View regional drug availability",
      "Log stock-out alerts by GTIN",
      "Initiate transfer requests",
    ],
  },
  {
    letter: "C",
    title: "Network Admin",
    sub: "Medical Liaison",
    body: "Central authority managing system governance and clinical advocacy across the entire corridor network.",
    perms: [
      "Verify facility credentials and IP whitelists",
      "Approve and mediate transfer routing",
      "Full immutable audit log access",
    ],
  },
];

export default function Roles() {
  return (
    <section className="bg-navy-2 px-10 py-24" id="roles">
      <div className={INNER}>
        <div className="max-w-[560px]">
          <div className={EYEBROW}>Role-Based Access</div>
          <h2 className={H2_LIGHT}>
            Built for every member of the oncology supply chain.
          </h2>
          <p className={P_LIGHT}>
            Three distinct roles with strict RBAC, each person sees exactly what
            they need, nothing more.
          </p>
        </div>

        <div className="my-12 grid grid-cols-2 gap-6">
          <div className={`${IMG_FRAME} h-[260px]`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800"
              alt="Collaboration"
              className={IMG}
            />
          </div>
          <div className={`${IMG_FRAME} h-[260px]`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1642055514517-7b52288890ec?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cGhhcm1hY3l8ZW58MHx8MHx8fDA%3D"
              alt="Pharmacy"
              className={IMG}
            />
          </div>
        </div>

        <div className="mt-12 grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
          {ROLES.map((r, i) => (
            <Reveal
              className="translate-y-5 rounded-[14px] border border-white/7 bg-white/4 p-8 transition-[opacity,translate,border-color] duration-500 hover:-translate-y-0.5! hover:border-sky/30"
              key={r.letter}
              delayMs={i * 100}
            >
              <div className="mb-5 flex size-11 items-center justify-center rounded-[11px] bg-linear-135 from-sky to-cyan font-display text-base font-extrabold text-white">
                {r.letter}
              </div>
              <div className="mb-1 font-display text-[15px] font-bold text-white">
                {r.title}
              </div>
              <div className="mb-3 text-xs font-semibold tracking-[0.5px] text-cyan uppercase">
                {r.sub}
              </div>
              <div className="text-[13.5px] leading-[1.7] text-white/45">
                {r.body}
              </div>
              <div className="mt-4 flex flex-col gap-1.5">
                {r.perms.map((p) => (
                  <div
                    className="flex items-center gap-[7px] text-[12.5px] text-white/55"
                    key={p}
                  >
                    {CHECK}
                    {p}
                  </div>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
