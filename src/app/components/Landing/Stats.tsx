import Counter from './Counter';
import Reveal from './Reveal';
import styles from '@/app/pages/landing/landing.module.css';

export default function Stats() {
  return (
    <section className={styles['stats']} aria-label="Platform statistics">
      <div className={styles['stats-inner']}>
        <Reveal className={styles['stat-block']} delayMs={0}>
          <div className={styles['stat-num']}><Counter target={50} /><span className={styles['stat-sup']}>%</span></div>
          <div className={styles['stat-label']}>of Nigerian patients face medication stock-outs</div>
        </Reveal>
        <Reveal className={styles['stat-block']} delayMs={100}>
          <div className={styles['stat-num']}>₦<Counter target={42} />M</div>
          <div className={styles['stat-label']}>in drug wastage prevented this quarter</div>
        </Reveal>
        <Reveal className={styles['stat-block']} delayMs={200}>
          <div className={styles['stat-num']}><Counter target={24} /></div>
          <div className={styles['stat-label']}>verified facilities in the Lagos–Ibadan corridor</div>
        </Reveal>
        <Reveal className={styles['stat-block']} delayMs={300}>
          <div className={styles['stat-num']}><Counter target={1847} /></div>
          <div className={styles['stat-label']}>biologics verified via GS1 this month</div>
        </Reveal>
      </div>
    </section>
  );
}
