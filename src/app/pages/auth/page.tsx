'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthPages from '@/app/components/AuthPages';
import { AuthView } from '@/app/lib/types';
import Link from 'next/link';

export default function AuthPage() {
  const [view, setView] = useState<AuthView>('login');
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = window.localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') setTheme(stored);
    else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) setTheme('dark');
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  const handleDoLogin = () => {
    // After login navigate to the dashboard route
    router.push('/pages/dashboard');
  };

  const handleToggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
        <>
        <AuthPages view={view} theme={theme} onDoLogin={handleDoLogin} onShowAuth={(v) => setView(v)} onToggleTheme={handleToggleTheme} />
        </>
  );
}
