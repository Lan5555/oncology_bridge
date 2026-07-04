'use client';
import styles from '@/app/pages/landing/landing.module.css';
import { useRouter } from 'next/navigation';
export default function CTA() {
  const router = useRouter();
  return (
    <section className={styles['cta-section']} id="cta">
      <div className={styles['cta-inner']}>
        <div className={styles['section-eyebrow']} style={{ justifyContent: 'center' }}>Join the Network</div>
        <h2 className={styles['cta-h2']}>Every patient deserves verified medicine, precisely when they need it.</h2>
        <p className={styles['cta-p']}>
          We&rsquo;re onboarding anchor institutions across Lagos and Ibadan. Apply for early
          access and place your facility at the centre of Nigeria&rsquo;s oncology supply
          solution.
        </p>
        <div className={styles['cta-actions']}>
          <button className={styles['btn-cta'] + ' ' + styles['primary']} onClick={() => router.push('/pages/dashboard')}>Apply for Facility Access</button>
          <button className={styles['btn-cta'] + ' ' + styles['outline']} onClick={() => router.push('/pages/demo')}>Schedule a Demo</button>
        </div>
      </div>
    </section>
  );
}
