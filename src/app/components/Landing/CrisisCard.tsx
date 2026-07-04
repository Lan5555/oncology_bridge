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
  red: 'bg-gradient-to-r from-red-500 to-orange-500',
  amber: 'bg-gradient-to-r from-amber-500 to-yellow-400',
  green: 'bg-gradient-to-r from-emerald-500 to-green-400',
};

export default function CrisisCard() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={ref} 
      className="bg-navy rounded-2xl p-8 w-full relative overflow-hidden"
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10">
        <div className="font-display text-8xl font-extrabold tracking-[-3px] leading-none text-gradient-red mb-1">
          50%
        </div>
        <div className="text-sm text-white/50 mb-8">
          of patients experience stock-outs
        </div>

        <div className="flex flex-col gap-2.5">
          {BARS.map((bar) => (
            <div className="flex items-center gap-2.5" key={bar.label}>
              <div className="text-[11.5px] text-white/40 w-[110px] flex-shrink-0">
                {bar.label}
              </div>
              <div className="flex-1 h-1.5 bg-white/10 rounded-[3px] overflow-hidden">
                <div
                  className={`h-full rounded-[3px] transition-all duration-1000 ease-out ${toneClass[bar.tone]}`}
                  style={{ 
                    width: visible ? `${bar.pct}%` : '0%',
                    transitionProperty: 'width',
                    transitionDuration: '1000ms',
                    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                />
              </div>
              <div className="text-[11.5px] font-semibold text-white/40 w-[30px] text-right">
                {bar.pct}%
              </div>
            </div>
          ))}
        </div>

        {/* After Oncology Bridge Section */}
        <div className="mt-7 pt-6 border-t border-white/10">
          <div className="text-[11px] font-semibold text-white/30 uppercase tracking-[1px] mb-2.5">
            After Oncology Bridge
          </div>
          
          <div className="flex items-center gap-2.5">
            <div className="text-[11.5px] text-white/50 w-[110px] flex-shrink-0">
              Stock-out rate
            </div>
            <div className="flex-1 h-1.5 bg-white/10 rounded-[3px] overflow-hidden">
              <div
                className="h-full rounded-[3px] transition-all duration-1000 ease-out"
                style={{
                  width: visible ? '28%' : '0%',
                  background: 'linear-gradient(90deg, #10B981, #34D399)',
                  transitionProperty: 'width',
                  transitionDuration: '1000ms',
                  transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />
            </div>
            <div className="text-[11.5px] font-semibold text-emerald-500 w-[30px] text-right">
              28%
            </div>
          </div>
          
          <div className="text-[11px] text-white/25 mt-2">
            ↓ 44% reduction from baseline
          </div>
        </div>
      </div>
    </div>
  );
}