'use client';

import { useEffect, useState } from 'react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      className={`fixed right-8 bottom-8 z-[850] flex size-11 cursor-pointer items-center justify-center rounded-full bg-linear-135 from-sky to-cyan text-white shadow-[0_4px_20px_rgba(14,165,233,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(14,165,233,0.5)] ${visible ? 'visible opacity-100' : 'invisible opacity-0'}`}
      id="backToTop"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current stroke-[2.5] [stroke-linecap:round] [stroke-linejoin:round]"><polyline points="18 15 12 9 6 15"></polyline></svg>
    </button>
  );
}
