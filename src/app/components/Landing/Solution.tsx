import Reveal from "./Reveal";
import {
  EYEBROW,
  H2_LIGHT,
  IMG,
  IMG_FRAME,
  INNER,
  P_LIGHT,
  SECTION,
} from "./classes";

const FEATURES = [
  {
    icon: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <path d="M7 2v20M2 12h5M7 7h14M7 17h14" />
      </>
    ),
    title: "GS1 DataMatrix Scanning",
    body: "Instant camera-based verification of GTIN, batch number, expiry date, and serial number, decoding NAFDAC-compliant barcodes in milliseconds.",
    tag: "Counterfeit Detection",
  },
  {
    icon: (
      <>
        <polyline points="17,1 21,5 17,9" />
        <path d="M3 11V9a4 4 0 014-4h14" />
        <polyline points="7,23 3,19 7,15" />
        <path d="M21 13v2a4 4 0 01-4 4H3" />
      </>
    ),
    title: "Real-Time Redistribution",
    body: "When stock falls below 60 days to expiry, the platform automatically identifies and alerts recipient hubs within a 50-mile radius, preventing waste while closing gaps.",
    tag: "Auto-Broadcast Alerts",
  },
  {
    icon: (
      <>
        <path d="M12 2v20M2 12h20M17 7l-5 5-5-5M7 17l5-5 5 5" />
      </>
    ),
    title: "Cold Chain Integrity",
    body: "Continuous 2°C–8°C monitoring with automated quarantine triggers. Any temperature breach halts the transfer flow instantly and pushes high-priority alerts to admins.",
    tag: "IoT Temperature Monitoring",
  },
  {
    icon: (
      <>
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </>
    ),
    title: "Offline-First Architecture",
    body: "Scans queue locally in IndexedDB when connectivity drops, then auto-sync when restored, built for Nigeria's variable 3G/4G networks without data loss.",
    tag: "Works on 3G/4G",
  },
  {
    icon: (
      <>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <line x1="12" y1="11" x2="12" y2="17" />
        <line x1="9" y1="14" x2="15" y2="14" />
      </>
    ),
    title: "Structured Prescriptions",
    body: "Doctors select ICD-10 codes, TNM staging, and insurers, the platform auto-packages these into a Unified Clinical Object routed to the closest verified pharmacy.",
    tag: "HMO-Matched Dispensing",
  },
  {
    icon: (
      <>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </>
    ),
    title: "AES-256 Field Encryption",
    body: "Hospital identifiers, patient data, and transaction volumes are encrypted at the application layer. Raw sensitive fields never touch the database in plaintext.",
    tag: "NDPR Compliant",
  },
];

export default function Solution() {
  return (
    <section className={`${SECTION} bg-navy`} id="solution">
      <div className={INNER}>
        <div className="max-w-[560px]">
          <div className={EYEBROW}>The Platform</div>
          <h2 className={H2_LIGHT}>
            A verified visibility layer for every vial in the network.
          </h2>
          <p className={P_LIGHT}>
            Oncosourz turns fragmented hospital inventory into a real-time,
            GS1-verified network, connecting surplus to shortage before a
            patient misses a dose.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-6">
          <div className={`${IMG_FRAME} h-[300px]`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800"
              alt="Digital Health"
              className={IMG}
            />
          </div>
          <div className={`${IMG_FRAME} h-[300px]`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://media.istockphoto.com/id/2207690669/photo/friendly-female-doctor-smiling-during-a-consultation-in-a-bright-office-setting.webp?a=1&b=1&s=612x612&w=0&k=20&c=7KE5IlD0YO_Pq9zPYisXHk1-9pBsXMS6oWJd93DXHEw="
              alt="Medical Lab"
              className={IMG}
            />
          </div>
        </div>

        <div className="mt-14 grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-px overflow-hidden rounded-2xl border border-white/7 bg-white/5">
          {FEATURES.map((f, i) => (
            <Reveal
              className="translate-y-5 bg-navy/60 p-8 transition-[opacity,translate,background-color] duration-500 hover:bg-sky/6"
              key={f.title}
              delayMs={i * 80}
            >
              <div className="mb-5 flex size-11 items-center justify-center rounded-[11px] border border-sky/20 bg-sky/12">
                <svg
                  viewBox="0 0 24 24"
                  className="size-5 fill-none stroke-sky stroke-2"
                >
                  {f.icon}
                </svg>
              </div>
              <div className="mb-2 font-display text-[15px] font-bold text-white">
                {f.title}
              </div>
              <div className="text-[13.5px] leading-[1.7] text-white/45">
                {f.body}
              </div>
              <div className="mt-3 inline-block rounded-[20px] border border-cyan/20 bg-cyan/10 px-2 py-[3px] text-[10.5px] font-bold tracking-[0.5px] text-cyan">
                {f.tag}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
