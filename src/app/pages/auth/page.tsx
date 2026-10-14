"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import AuthPages from "@/app/components/AuthPages";
import PingServerLoader from "@/app/components/Loader/ping-server.";
import type { AuthView } from "@/app/lib/types";
import { AUTH_SERVICE } from "@/app/services/auth-service/auth-service";

export default function AuthPage({
  initialView = "login",
}: {
  initialView?: AuthView;
}) {
  const [view, setView] = useState<AuthView>(initialView);
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isMounted, setIsMounted] = useState(false);
  const [serverReady, setServerReady] = useState<boolean>(false);

  // Handle hydration - only run on client
  useEffect(() => {
    setIsMounted(true);
    const stored = window.localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
    } else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
    void AUTH_SERVICE.pingServer().then((res) => {
      if (res.success) {
        setServerReady(true);
      } else {
        toast.error(res.message);
      }
    });
  }, []);

  // Update theme when it changes
  useEffect(() => {
    if (!isMounted) return;

    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("theme", theme);
  }, [theme, isMounted]);

  const handleDoLogin = () => {
    // After login navigate to the dashboard route
    router.push("/portal");
  };

  const handleToggleTheme = () =>
    setTheme((t) => (t === "dark" ? "light" : "dark"));

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <div className="min-h-screen w-full bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }
  if (!serverReady) {
    return <PingServerLoader />;
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
