"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardView from "@/app/pages/dashboard/page";
import { useProvider } from "@/app/providers/provider";

export default function PortalPage() {
  const { userData, sessionReady } = useProvider();
  const router = useRouter();
  const signedIn = Boolean(userData.token);

  useEffect(() => {
    if (sessionReady && !signedIn) router.replace("/login");
  }, [sessionReady, signedIn, router]);

  if (!sessionReady || !signedIn) return null;
  return <DashboardView />;
}
