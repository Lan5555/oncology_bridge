"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import AuthPages from "@/app/components/AuthPages";
import { useProvider } from "@/app/providers/provider";
import type { AuthView } from "@/app/lib/types";
import { AUTH_SERVICE } from "@/app/services/auth-service/auth-service";

export default function AuthPage({
  initialView = "login",
}: {
  initialView?: AuthView;
}) {
  const [view, setView] = useState<AuthView>(initialView);
  const router = useRouter();
  const { theme, setTheme } = useProvider();
  const [isMounted, setIsMounted] = useState(false);

  // Handle hydration - only run on client
  useEffect(() => {
    setIsMounted(true);
    void AUTH_SERVICE.pingServer().then((res) => {
      if (!res.success)
        toast.error(
          res.message ||
            "The service is temporarily unavailable. Please try signing in again shortly.",
        );
    });
  }, []);

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
