import Reveal from './Reveal';
import CrisisCard from './CrisisCard';
import styles from '@/app/pages/landing/landing.module.css';

const POINTS = [
  {
    num: 'Problem 01',
    title: 'The 50% Stock-Out Rate',
    body: 'Half of Nigerian oncology patients regularly experience medication stock-outs during critical treatment windows, forcing families to manually hunt for life-saving drugs across cities.',
  },
  {
    num: 'Problem 02',
    title: 'The Verification Black Box',
    body: 'Fragmented supply chains mean doctors and pharmacists cannot verify the pedigree or cold-chain history of the medicines they receive — creating clinical risk with every dose.',
  },
  {
    num: 'Problem 03',
    title: 'Invisible Surplus Stock',
    body: "High-value biologics expire unused in one facility while patients elsewhere face stock-outs. Without visibility, redistribution is impossible. The problem isn't always supply — it's sight.",
  },
];

export default function Problem() {
  return (
    <section className={styles['section'] + ' ' + styles['problem']} id="problem">
      <div className={styles['section-inner']}>
        <div className={styles['problem-grid']}>
          <div>
            <div className={styles['section-eyebrow']}>The Access Crisis</div>
            <h2 className={styles['section-h2']}>Nigeria&rsquo;s oncology supply chain is broken at two ends.</h2>
            <p className={styles['section-p']} style={{ marginBottom: '2.5rem' }}>
              Life-saving biologics expire in one hospital while patients in the next district go
              without. The supply chain isn&rsquo;t just inefficient — it&rsquo;s invisible.
            </p>

            <div className={styles['problem-points']}>
              {POINTS.map((p, i) => (
                <Reveal className={styles['problem-point']} key={p.num} delayMs={i * 80}>
                  <div className={styles['pp-num']}>{p.num}</div>
                  <div className={styles['pp-title']}>{p.title}</div>
                  <div className={styles['pp-body']}>{p.body}</div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className={styles['problem-visual']}>
            <CrisisCard />
          </div>
        </div>
      </div>
    </section>
  );
}
