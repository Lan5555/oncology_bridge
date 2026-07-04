'use client';
import styles from '@/app/pages/landing/landing.module.css';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const LINKS = [
  { href: '#problem', label: 'The Problem' },
  { href: '#solution', label: 'Platform' },
  { href: '#workflow', label: 'How It Works' },
  { href: '#roles', label: 'For Teams' },
  { href: '#regulatory', label: 'Compliance' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMob = () => setMobileOpen(false);
  const router = useRouter();

  return (
    <>
      <nav className={styles['nav'] + (scrolled ? ' ' + styles['scrolled'] : '')} id="mainNav">
        <div className={styles['nav-logo']}>
          <div className={styles['nav-logo-mark']}>
            <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
          </div>
          <div>
            <div className={styles['nav-logo-name']}>Oncology Bridge</div>
            <div className={styles['nav-logo-tag']}>Lagos–Ibadan Network</div>
          </div>
        </div>

        <div className={styles['nav-links']}>
          {LINKS.map((l) => (
            <a href={l.href} key={l.href}>{l.label}</a>
          ))}
        </div>

        <div className={styles['nav-cta']}>
          <button className={styles['btn-nav'] + ' ' + styles['ghost']} onClick={() => router.push('/pages/auth')}>
            Sign In
          </button>
          <button className={styles['btn-nav'] + ' ' + styles['solid']} onClick={() => router.push('/pages/auth')}>
            Request Access
          </button>
        </div>

        <div
          className={styles['hamburger']}
          id="hamburger"
          aria-label="Open menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span style={mobileOpen ? { transform: 'rotate(45deg) translate(4px,4px)' } : undefined} />
          <span style={mobileOpen ? { opacity: 0 } : undefined} />
          <span style={mobileOpen ? { transform: 'rotate(-45deg) translate(4px,-4px)' } : undefined} />
        </div>
      </nav>

      <div className={styles['nav-mobile'] + (mobileOpen ? ' ' + styles['open'] : '')} id="mobileNav">
        {LINKS.map((l) => (
          <a href={l.href} key={l.href} onClick={closeMob}>{l.label}</a>
        ))}
        <a href="#cta" onClick={closeMob} style={{ color: 'var(--cyan)', fontWeight: 700 }}>
          Request Access →
        </a>
      </div>
    </>
  );
}