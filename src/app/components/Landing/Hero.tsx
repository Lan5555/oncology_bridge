'use client'
import Particles from './Particles';
import NetworkDiagram from './NetworkDiagram';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
  const router= useRouter();
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-navy px-8 pt-[100px] pb-16 before:pointer-events-none before:absolute before:-top-[200px] before:left-1/2 before:size-[800px] before:-translate-x-1/2 before:bg-[radial-gradient(circle,rgba(14,165,233,0.18)_0%,transparent_65%)] before:content-[''] after:pointer-events-none after:absolute after:-right-[100px] after:-bottom-[100px] after:size-[500px] after:bg-[radial-gradient(circle,rgba(6,182,212,0.12)_0%,transparent_65%)] after:content-['']">
      <Particles />

      <div className="relative z-[2] max-w-[860px] text-center">
        <div className="mb-7 inline-flex animate-[slideUp_.6s_.1s_ease_forwards] items-center gap-2 rounded-[20px] border border-sky/25 bg-sky/12 px-3.5 py-1.5 text-[11.5px] font-semibold tracking-[1px] text-cyan uppercase opacity-0">
          <div className="size-1.5 animate-blink rounded-full bg-cyan" />
          Live across Lagos–Ibadan · 24 Facilities
        </div>

        <h1
          className="mb-6 font-display text-[clamp(2.4rem,5.5vw,4.2rem)] leading-[1.1] font-extrabold tracking-[-1.5px] text-white"
          aria-label="No cancer patient should lose their battle because a vial exists just miles away"
        >
          {WORDS.map((w, i) => (
            <span
              key={i}
              className={
                'inline-block animate-[slideUp_.5s_ease_forwards] opacity-0' +
                (w.accent ? ' bg-linear-135 from-sky via-cyan to-teal bg-clip-text text-transparent' : '')
              }
              style={{ animationDelay: `${w.delay}s` }}
            >
              {w.text}
              {w.break ? <br /> : null}
            </span>
          ))}
        </h1>

        <p className="mx-auto mb-10 max-w-[580px] animate-[slideUp_.6s_.9s_ease_forwards] text-[clamp(15px,2vw,18px)] leading-[1.75] text-white/60 opacity-0">
          Oncosourz is a real-time inventory visibility and verification platform closing
          Nigeria&rsquo;s cancer drug access gap — one verified vial at a time.
        </p>

        <div className="flex animate-[slideUp_.5s_1.1s_ease_forwards] flex-wrap items-center justify-center gap-3 opacity-0">
          <button className="flex cursor-pointer items-center gap-2 rounded-[10px] bg-linear-135 from-sky to-cyan px-7 py-3.5 font-display text-sm font-bold text-white shadow-[0_4px_24px_rgba(14,165,233,0.35)] transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(14,165,233,0.45)]" onClick={()=> router.push('/pages/auth')}>
            <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-white stroke-2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            Request Platform Access
          </button>
          <button className="flex cursor-pointer items-center gap-2 rounded-[10px] border border-white/15 bg-white/6 px-7 py-3.5 font-display text-sm font-semibold text-white/85 transition-all duration-250 hover:border-white/30 hover:bg-white/10" onClick={() => toast.info('A link to demo would be connected here..')}>
            <svg viewBox="0 0 24 24" className="size-3.5 fill-none stroke-current stroke-2"><circle cx="12" cy="12" r="10" /><polygon points="10,8 16,12 10,16" /></svg>
            Watch Demo
          </button>
        </div>

        <div className="relative z-[2] mt-14 animate-[slideUp_.6s_1.3s_ease_forwards] opacity-0">
          <div className="mx-auto w-full max-w-[700px] opacity-90">
            <NetworkDiagram />
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-[2] flex animate-bounce-slow flex-col items-center gap-2 text-[11px] tracking-[1px] text-white/30 uppercase" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="size-[18px] fill-none stroke-current stroke-2"><polyline points="6,9 12,15 18,9" /></svg>
        Scroll
      </div>
    </section>
  );
}
