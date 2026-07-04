'use client';

import { useEffect, useState } from 'react';
import styles from '@/app/pages/landing/landing.module.css';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      className={styles['back-to-top'] + (visible ? ' ' + styles.visible : '')}
      id="backToTop"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg>
    </button>
  );
}
