import Reveal from './Reveal';
import styles from  '@/app/pages/landing/landing.module.css';

const STEPS = [
  {
    num: '01',
    icon: <><path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" /><circle cx="12" cy="12" r="2" /></>,
    title: 'Stock Ingestion & POS Sync',
    body: 'A new shipment arrives. The pharmacist logs it into their POS system. A background webhook instantly pushes the update — batch numbers, quantities, expiry dates — into the network ledger.',
  },
  {
    num: '02',
    icon: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" /></>,
    title: 'Structured Prescription',
    body: "The oncologist selects an ICD-10 code, TNM stage, and insurer. The platform packages this into a Unified Clinical Object and filters available drugs to those covered under the patient's HMO tariff.",
  },
  {
    num: '03',
    icon: <><polyline points="17,1 21,5 17,9" /><path d="M3 11V9a4 4 0 014-4h14" /></>,
    title: 'Order Match & Reserve',
    body: 'The platform matches the prescription to the closest verified pharmacy with the correct drug in stock. The pharmacist accepts, and those exact vials are immediately deducted from the live network inventory.',
  },
  {
    num: '04',
    icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>,
    title: 'Prior-Authorization Loop',
    body: 'The Adapter Layer routes the clinical JSON to the HMO via API (modern), portal auto-fill (legacy), or a WAOAB-sealed PDF with an anti-fraud QR code (paper-based) — then drops the claims code into the pharmacy dashboard.',
  },
  {
    num: '05',
    icon: <><rect x="2" y="2" width="20" height="20" rx="2" /><path d="M7 2v20M2 12h5M7 7h14M7 17h14" /></>,
    title: 'GS1 Validation Scan',
    body: 'Payment clears. A cold-chain courier is dispatched. The pharmacist scans the GS1 DataMatrix — the backend instantly confirms the batch is authentic, unrecalled, and unexpired. Dashboard turns green: "WAOAB Clean-Stock Cleared."',
  },
  {
    num: '06',
    icon: <><path d="M22 2L11 13" /><path d="M22 2L15 22l-4-9-9-4 20-7z" /></>,
    title: 'Last-Mile Delivery',
    body: 'The courier delivers directly to the oncology treatment room in a temperature-monitored cold-chain bag. The nurse scans a delivery QR code — confirming arrival within the safety window. Dose administered. Case closed.',
  },
];

export default function Workflow() {
  return (
    <section className={styles['section']} id="workflow">
      <div className={styles['section-inner']}>
        <div style={{ maxWidth: '560px', marginBottom: 0 }}>
          <div className={styles['section-eyebrow']}>How It Works</div>
          <h2 className={styles['section-h2']}>From pharmacy shelf to treatment chair — verified every step.</h2>
          <p className={styles['section-p']}>
            Six integrated stages ensure a vial&rsquo;s journey is tracked, authenticated, and
            cold-chain-secured before it reaches a patient.
          </p>
        </div>

        <div className={styles['workflow-steps']}>
          {STEPS.map((s, i) => (
            <Reveal className={styles['wf-card']} key={s.num} delayMs={i * 80}>
              <div className={styles['wf-step-num']}>{s.num}</div>
              <div className={styles['wf-icon']}><svg viewBox="0 0 24 24">{s.icon}</svg></div>
              <div className={styles['wf-title']}>{s.title}</div>
              <div className={styles['wf-body']}>{s.body}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
