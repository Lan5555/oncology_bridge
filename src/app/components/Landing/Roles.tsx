import Reveal from './Reveal';
import styles from '@/app/pages/landing/landing.module.css';

const CHECK = <svg viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12" /></svg>;

const ROLES = [
  {
    letter: 'A',
    title: 'Submitting Pharmacist',
    sub: 'Donor Hub',
    body: 'Operating at facilities with surplus or near-expiry stock. The first point of truth in the verification chain.',
    perms: [
      'Scan GS1 barcodes and log inventory',
      'Flag batches as available for redistribution',
      "View own facility's live stock levels",
    ],
  },
  {
    letter: 'B',
    title: 'Requesting Pharmacist',
    sub: 'Recipient Hub',
    body: 'Operating at facilities facing shortages. Connected to the regional availability map in real time.',
    perms: [
      'View regional drug availability',
      'Log stock-out alerts by GTIN',
      'Initiate transfer requests',
    ],
  },
  {
    letter: 'C',
    title: 'Network Admin',
    sub: 'Medical Liaison',
    body: 'Central authority managing system governance and clinical advocacy across the entire corridor network.',
    perms: [
      'Verify facility credentials and IP whitelists',
      'Approve and mediate transfer routing',
      'Full immutable audit log access',
    ],
  },
];

export default function Roles() {
  return (
    <section className={styles['roles']} id="roles">
      <div className={styles['section-inner']}>
        <div style={{ maxWidth: '560px' }}>
          <div className={styles['section-eyebrow']}>Role-Based Access</div>
          <h2 className={styles['section-h2'] + ' ' + styles['light']}>Built for every member of the oncology supply chain.</h2>
          <p className={styles['section-p'] + ' ' + styles['light']}>
            Three distinct roles with strict RBAC — each person sees exactly what they need,
            nothing more.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '3rem', marginBottom: '3rem' }}>
          <div className={styles['img-frame']} style={{ height: '260px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800"
              alt="Collaboration"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div className={styles['img-frame']} style={{ height: '260px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1642055514517-7b52288890ec?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cGhhcm1hY3l8ZW58MHx8MHx8fDA%3D"
              alt="Pharmacy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>

        <div className={styles['roles-grid']}>
          {ROLES.map((r, i) => (
            <Reveal className={styles['role-card']} key={r.letter} delayMs={i * 100}>
              <div className={styles['role-letter']}>{r.letter}</div>
              <div className={styles['role-title']}>{r.title}</div>
              <div className={styles['role-sub']}>{r.sub}</div>
              <div className={styles['role-body']}>{r.body}</div>
              <div className={styles['role-perms']}>
                {r.perms.map((p) => (
                  <div className={styles['role-perm']} key={p}>{CHECK}{p}</div>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
