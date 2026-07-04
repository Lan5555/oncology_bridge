'use client';

import { useEffect, useRef, useState } from 'react';

interface Bar {
  label: string;
  pct: number;
  tone: 'red' | 'amber' | 'green';
}

const BARS: Bar[] = [
  { label: 'Medication gap', pct: 50, tone: 'red' },
  { label: 'Unverified stock', pct: 68, tone: 'red' },
  { label: 'Expiry wastage', pct: 34, tone: 'amber' },
  { label: 'Cold chain breaches', pct: 22, tone: 'amber' },
];

const toneClass: Record<Bar['tone'], string> = {
  red: 'h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-1000',
  amber: 'h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-1000',
  green: 'h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000',
};

export default function CrisisCard() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={"relative w-full overflow-hidden rounded-2xl bg-[#050e1f] p-8 before:absolute before:inset-0 before:bg-gradient-to-br before:from-sky-500/10 before:to-transparent before:content-[\"\"]"}>
      <div className={"mb-1 bg-gradient-to-br from-red-500 to-orange-500 bg-clip-text text-7xl font-extrabold leading-none text-transparent [font-family:'Plus_Jakarta_Sans',sans-serif]"}>50%</div>
      <div className={"mb-8 text-sm text-white/55"}>of patients experience stock-outs</div>

      <div className={"flex flex-col gap-2.5"}>
        {BARS.map((bar) => (
          <div className={"flex items-center gap-2.5"} key={bar.label}>
            <div className={"w-[110px] shrink-0 text-[11.5px] text-white/45"}>{bar.label}</div>
            <div className={"h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"}>
              <div
                className={toneClass[bar.tone]}
                style={{ width: visible ? `${bar.pct}%` : '0%' }}
              />
            </div>
            <div className={"w-[30px] text-right text-[11.5px] font-semibold text-white/40"}>{bar.pct}%</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,.07)' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'rgba(255,255,255,.3)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '10px',
          }}
        >
          After Oncology Bridge
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-[110px] shrink-0 text-[11.5px] text-white/50">Stock-out rate</div>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000"
              style={{
                width: visible ? '28%' : '0%',
                background: 'linear-gradient(90deg,#10B981,#34D399)',
              }}
            />
          </div>
          <div className="w-[30px] text-right text-[11.5px] font-semibold text-emerald-500">28%</div>
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.25)', marginTop: '8px' }}>
          ↓ 44% reduction from baseline
        </div>
      </div>
    </div>
  );
}
