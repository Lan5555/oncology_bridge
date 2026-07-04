'use client';
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
      <nav 
        className={`fixed top-0 left-0 w-full z-[1000] flex items-center justify-between px-6 md:px-12 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm py-3' 
            : 'bg-transparent py-5'
        }`} 
        id="mainNav"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-white fill-none stroke-[2.2]"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
          </div>
          <div>
            <div className="font-bold text-[15px] text-slate-900 dark:text-white tracking-tight leading-none">Oncology Bridge</div>
            <div className="text-[9.5px] font-bold text-brand-accent tracking-wider uppercase mt-1">Lagos–Ibadan Network</div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {LINKS.map((l) => (
            <a 
              href={l.href} 
              key={l.href} 
              className="text-[13.5px] font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-primary dark:hover:text-white transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button 
            className="px-4 py-2 text-[13.5px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            onClick={() => router.push('/pages/auth')}
          >
            Sign In
          </button>
          <button 
            className="px-4 py-2 text-[13.5px] font-semibold text-white bg-brand-primary hover:bg-brand-dark rounded-xl transition-all shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 cursor-pointer"
            onClick={() => router.push('/pages/auth')}
          >
            Request Access
          </button>
        </div>

        <button
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 focus:outline-none z-50 cursor-pointer"
          aria-label="Open menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span 
            className="w-6 h-0.5 bg-slate-800 dark:bg-white transition-all duration-300"
            style={mobileOpen ? { transform: 'rotate(45deg) translate(4px,4px)' } : undefined} 
          />
          <span 
            className="w-6 h-0.5 bg-slate-800 dark:bg-white transition-all duration-300"
            style={mobileOpen ? { opacity: 0 } : undefined} 
          />
          <span 
            className="w-6 h-0.5 bg-slate-800 dark:bg-white transition-all duration-300"
            style={mobileOpen ? { transform: 'rotate(-45deg) translate(4px,-4px)' } : undefined} 
          />
        </button>
      </nav>

      <div 
        className={`fixed inset-y-0 right-0 w-64 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 z-[999] shadow-xl p-8 flex flex-col gap-6 md:hidden transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`} 
        id="mobileNav"
      >
        <div className="mt-16 flex flex-col gap-5">
          {LINKS.map((l) => (
            <a 
              href={l.href} 
              key={l.href} 
              onClick={closeMob}
              className="text-base font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-primary dark:hover:text-white transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a 
            href="#cta" 
            onClick={closeMob} 
            className="text-base font-bold text-brand-accent mt-2 hover:underline"
          >
            Request Access →
          </a>
        </div>
      </div>
    </>
  );
}
