import Particles from './Particles';
import NetworkDiagram from './NetworkDiagram';
import styles from '@/app/pages/landing/landing.module.css';

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
    <section className={styles['hero']}>
      <Particles />

      <div className={styles['hero-inner']}>
        <div className={styles['hero-eyebrow']}>
          <div className={styles['dot']} />
          Live across Lagos–Ibadan · 24 Facilities
        </div>

        <h1
          className={styles['hero-h1']}
          aria-label="No cancer patient should lose their battle because a vial exists just miles away"
        >
          {WORDS.map((w, i) => (
            <span
              key={i}
              className={styles['word'] + (w.accent ? ' ' + styles['accent'] : '')}
              style={{ animationDelay: `${w.delay}s` }}
            >
              {w.text}
              {w.break ? <br /> : null}
            </span>
          ))}
        </h1>

        <p className={styles['hero-p']}>
          Oncology Bridge is a real-time inventory visibility and verification platform closing
          Nigeria&rsquo;s cancer drug access gap — one verified vial at a time.
        </p>

        <div className={styles['hero-actions']}>
          <button className={styles['btn-hero-primary']}>
            <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            Request Platform Access
          </button>
          <button className={styles['btn-hero-ghost']}>
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polygon points="10,8 16,12 10,16" /></svg>
            Watch Demo
          </button>
        </div>

        <div className={styles['hero-network']}>
          <div className={styles['network-svg-wrap']}>
            <NetworkDiagram />
          </div>
        </div>
      </div>

      <div className={styles['scroll-hint']} aria-hidden="true">
        <svg viewBox="0 0 24 24"><polyline points="6,9 12,15 18,9" /></svg>
        Scroll
      </div>
    </section>
  );
}
