import Particles from './Particles';
import NetworkDiagram from './NetworkDiagram';

const WORDS: { text: string; delay: number; accent?: boolean; break?: boolean }[] = [
  { text: 'No\u00A0', delay: 0.3 },
  { text: 'cancer\u00A0', delay: 0.38 },
  { text: 'patient\u00A0', delay: 0.46 },
  { text: 'should\u00A0', delay: 0.54 },
  { text: 'lose\u00A0', delay: 0.62 },
  { text: 'their\u00A0', delay: 0.7 },
  { text: 'battle', delay: 0.78, break: true },
  { text: 'because\u00A0', delay: 0.86, accent: true },
  { text: 'a\u00A0', delay: 0.92, accent: true },
  { text: 'vial\u00A0', delay: 0.98, accent: true },
  { text: 'exists\u00A0', delay: 1.04, accent: true },
  { text: 'just\u00A0', delay: 1.1, accent: true },
  { text: 'miles\u00A0', delay: 1.16, accent: true },
  { text: 'away.', delay: 1.22, accent: true },
];

export default function Hero() {
  return (
    <section className={"relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#050e1f] px-8 pt-[100px] pb-16 text-center before:pointer-events-none before:absolute before:left-1/2 before:top-[-200px] before:h-[800px] before:w-[800px] before:-translate-x-1/2 before:rounded-full before:bg-[radial-gradient(circle,rgba(14,165,233,0.18),transparent_65%)] before:content-[\"\"] after:pointer-events-none after:absolute after:bottom-[-100px] after:right-[-100px] after:h-[500px] after:w-[500px] after:rounded-full after:bg-[radial-gradient(circle,rgba(6,182,212,0.12),transparent_65%)] after:content-[\"\"]"}>
      <Particles />

      <div className={"relative z-[2] max-w-[860px]"}>
        <div className={"mb-7 inline-flex items-center gap-2 rounded-full border border-sky-400/25 bg-sky-500/10 px-3.5 py-1.5 text-[11.5px] font-semibold uppercase tracking-[1px] text-cyan-400"}>
          <div className={"h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400"} />
          Live across Lagos–Ibadan · 24 Facilities
        </div>

        <h1
          className={"mb-6 text-[clamp(2.4rem,5.5vw,4.2rem)] font-extrabold leading-[1.1] text-white [font-family:'Plus_Jakarta_Sans',sans-serif]"}
          aria-label="No cancer patient should lose their battle because a vial exists just miles away"
        >
          {WORDS.map((w, i) => (
            <span
              key={i}
              className={"inline-block" + (w.accent ? ' ' + "bg-gradient-to-br from-sky-500 via-cyan-500 to-cyan-700 bg-clip-text text-transparent" : '')}
              style={{ animationDelay: `${w.delay}s` }}
            >
              {w.text}
              {w.break ? <br /> : null}
            </span>
          ))}
        </h1>

        <p className={"mx-auto mb-10 max-w-[580px] text-[clamp(15px,2vw,18px)] leading-8 text-white/60"}>
          Oncology Bridge is a real-time inventory visibility and verification platform closing
          Nigeria&rsquo;s cancer drug access gap — one verified vial at a time.
        </p>

        <div className={"flex flex-wrap items-center justify-center gap-3"}>
          <button className={"inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border-0 bg-gradient-to-br from-sky-500 to-cyan-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-500/40 [font-family:'Plus_Jakarta_Sans',sans-serif] [&_svg]:h-4 [&_svg]:w-4 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2"}>
            <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            Request Platform Access
          </button>
          <button className={"inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-bold text-white/85 transition hover:border-white/30 hover:bg-white/10 [font-family:'Plus_Jakarta_Sans',sans-serif] [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2"}>
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polygon points="10,8 16,12 10,16" /></svg>
            Watch Demo
          </button>
        </div>

        <div className={"relative z-[2] mt-14"}>
          <div className={"mx-auto w-full max-w-[700px] opacity-90"}>
            <NetworkDiagram />
          </div>
        </div>
      </div>

      <div className={"absolute bottom-8 left-1/2 z-[2] flex -translate-x-1/2 flex-col items-center gap-2 text-[11px] uppercase tracking-[1px] text-white/30 [&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-2"} aria-hidden="true">
        <svg viewBox="0 0 24 24"><polyline points="6,9 12,15 18,9" /></svg>
        Scroll
      </div>
    </section>
  );
}
