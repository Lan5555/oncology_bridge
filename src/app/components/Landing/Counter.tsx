'use client';

import { useEffect, useRef, useState } from 'react';
import styles from '@/app/pages/landing/landing.module.css';

interface CounterProps {
  target: number;
  durationMs?: number;
}

export default function Counter({ target, durationMs = 1800 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            let start: number | null = null;
            const step = (ts: number) => {
              if (start === null) start = ts;
              const progress = Math.min((ts - start) / durationMs, 1);
              const ease = 1 - Math.pow(1 - progress, 3);
              setValue(Math.floor(ease * target));
              if (progress < 1) {
                requestAnimationFrame(step);
              } else {
                setValue(target);
              }
            };
            requestAnimationFrame(step);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [target, durationMs]);

  return <span ref={ref} className={styles.count}>{value.toLocaleString()}</span>;
}
