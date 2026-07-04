'use client';
import { useEffect, useRef } from 'react';
import styles from '@/app/pages/landing/landing.module.css';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  as?: 'div';
}

/**
 * Wraps its children in an element that gains the `.revealed` class
 * (defined in globals.css) once it scrolls into view. Mirrors the
 * original page's IntersectionObserver-based reveal animation.
 */
export default function Reveal({ children, className = '', delayMs = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles['revealed']);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${styles['reveal']} ${className}`} style={{ transitionDelay: `${delayMs}ms` }}>
      {children}
    </div>
  );
}
