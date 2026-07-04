import Reveal from './Reveal';
import styles from '@/app/pages/landing/landing.module.css';
const REGS = [
  {
    tone: 'blue',
    icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    title: 'NAFDAC Maturity Level 4',
    body: "Nigeria's shift to full traceability makes digital inventory tracking a regulatory requirement. Oncology Bridge is the user-friendly front-end for NAFDAC compliance.",
  },
  {
    tone: 'green',
    icon: <><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22,4 12,14.01 9,11.01" /></>,
    title: 'NHIA Subsidies Expanding',
    body: 'New National Health Insurance Authority subsidies are rapidly increasing oncology patient volume — making stock-out prevention critical for facility operations and financial sustainability.',
  },
  {
    tone: 'amber',
    icon: <><polyline points="23,6 13.5,15.5 8.5,10.5 1,18" /><polyline points="17,6 23,6 23,12" /></>,
    title: '30%+ Health Inflation',
    body: "With health inflation exceeding 30%, facilities can no longer absorb the financial loss from drug wastage. Redistribution is no longer just ethical — it's economically essential.",
  },
  {
    tone: 'blue',
    icon: <><rect x="2" y="2" width="20" height="20" rx="2" /><path d="M7 2v20M2 12h5M7 7h14M7 17h14" /></>,
    title: 'GS1 Global Standards',
    body: "Our GS1 DataMatrix integration aligns with international pharmaceutical serialization standards — future-proofing the platform as Nigeria's drug traceability regulation matures.",
  },
];

export default function Regulatory() {
  return (
    <section className={styles['section'] + ' ' + styles['regs']} id="regulatory">
      <div className={styles['section-inner']}>
        <div style={{ textAlign: 'center', maxWidth: '560px', margin: '0 auto 3rem' }}>
          <div className={styles['section-eyebrow']} style={{ justifyContent: 'center' }}>2026 Regulatory Tailwinds</div>
          <h2 className={styles['section-h2']} style={{ textAlign: 'center' }}>Built for the regulatory moment Nigeria is entering.</h2>
          <p className={styles['section-p']} style={{ margin: '0 auto', textAlign: 'center' }}>
            Three converging forces make this the right platform at the right time.
          </p>
        </div>
        <div className={styles['reg-grid']}>
          {REGS.map((r) => (
            <Reveal className={styles['reg-card']} key={r.title}>
              <div className={styles['reg-ico'] + ' ' + r.tone}><svg viewBox="0 0 24 24">{r.icon}</svg></div>
              <div>
                <div className={styles['reg-title']}>{r.title}</div>
                <div className={styles['reg-body']}>{r.body}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
