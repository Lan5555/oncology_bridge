'use client';

import { useEffect, useRef, useState } from 'react';
import styles from '@/app/pages/landing/landing.module.css';

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
  red: 'crisis-bar-fill red',
  amber: 'crisis-bar-fill amber',
  green: 'crisis-bar-fill',
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
    <div ref={ref} className={styles['crisis-card']}>
      <div className={styles['crisis-stat-big']}>50%</div>
      <div className={styles['crisis-stat-label']}>of patients experience stock-outs</div>

      <div className={styles['crisis-bars']}>
        {BARS.map((bar) => (
          <div className={styles['crisis-bar-row']} key={bar.label}>
            <div className={styles['crisis-bar-label']}>{bar.label}</div>
            <div className={styles['crisis-bar-track']}>
              <div
                className={toneClass[bar.tone]}
                style={{ width: visible ? `${bar.pct}%` : '0%' }}
              />
            </div>
            <div className={styles['crisis-bar-pct']}>{bar.pct}%</div>
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
        <div className="crisis-bar-row">
          <div className="crisis-bar-label" style={{ color: 'rgba(255,255,255,.5)' }}>Stock-out rate</div>
          <div className="crisis-bar-track">
            <div
              className="crisis-bar-fill"
              style={{
                width: visible ? '28%' : '0%',
                background: 'linear-gradient(90deg,#10B981,#34D399)',
              }}
            />
          </div>
          <div className="crisis-bar-pct" style={{ color: '#10B981' }}>28%</div>
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.25)', marginTop: '8px' }}>
          ↓ 44% reduction from baseline
        </div>
      </div>
    </div>
  );
}
