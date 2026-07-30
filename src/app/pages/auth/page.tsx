'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthPages from '@/app/components/AuthPages';
import { AuthView } from '@/app/lib/types';
import Link from 'next/link';
import { AUTH_SERVICE } from '@/app/services/auth-service/auth-service';
import { toast } from 'sonner';
import PingServerLoader from '@/app/components/Loader/ping-server.';

export default function AuthPage() {
  const [view, setView] = useState<AuthView>('login');
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMounted, setIsMounted] = useState(false);
  const [serverReady, setServerReady] = useState<boolean>(false);

  const pingServer = async() => {
    const res = await AUTH_SERVICE.pingServer();
    if(res.success){
      setServerReady(true);
    }else{
      toast.error(res.message);
    }
  }

  // Handle hydration - only run on client
  useEffect(() => {
    setIsMounted(true);
    const stored = window.localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') {
      setTheme(stored);
    } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
    pingServer();
  }, []);

  // Update theme when it changes
  useEffect(() => {
    if (!isMounted) return;
    
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem('theme', theme);
  }, [theme, isMounted]);

  const handleDoLogin = () => {
    // After login navigate to the dashboard route
    router.push('/pages/dashboard');
  };

  const handleToggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <div className="min-h-screen w-full bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }
  if(!serverReady){
    return (
      <PingServerLoader/>
    )
  }

  return (
    <AuthPages 
      view={view} 
      theme={theme} 
      onDoLogin={handleDoLogin} 
      onShowAuth={(v) => setView(v)} 
      onToggleTheme={handleToggleTheme} 
    />
  );
}