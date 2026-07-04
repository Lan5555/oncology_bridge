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
      className={"invisible fixed bottom-8 right-8 z-[850] flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-gradient-to-br from-sky-500 to-cyan-500 text-white opacity-0 shadow-lg shadow-sky-500/40 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/50 [&_svg]:h-5 [&_svg]:w-5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[2.5]" + (visible ? ' ' + "visible opacity-100" : '')}
      id="backToTop"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg>
    </button>
  );
}
