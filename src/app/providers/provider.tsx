"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { Theme } from "../lib/types";
import { FacilityResponse } from "../models/facility-model";
import { User, UserResponse } from "../models/user-model";

type AppContextType = {
  userData: UserResponse;
  setUser: (data: UserResponse) => void;
  facilityResponse: FacilityResponse;
  setFacilityResponse: (res: FacilityResponse) => void;
  sessionReady: boolean;
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUser] = useState<UserResponse>(UserResponse.fromJson({}));
  const [facilityResponse, setFacilityResponse] = useState<FacilityResponse>(
    FacilityResponse.fromJson({}),
  );
  const [sessionReady, setSessionReady] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    const readTheme = () => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem("theme");
      } catch {
        /* Use device preference if storage is unavailable. */
      }
      setTheme(
        saved === "light" || saved === "dark"
          ? saved
          : window.matchMedia?.("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light",
      );
      setThemeReady(true);
    };
    readTheme();
    const sync = (event: StorageEvent) => {
      if (event.key === "theme" || event.key === null) readTheme();
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(() => {
    if (!themeReady) return;
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
    root.style.colorScheme = theme;
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* Theme still applies when persistence is unavailable. */
    }
  }, [theme, themeReady]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("userSession");
      if (stored) setUser(UserResponse.fromJson(JSON.parse(stored)));
    } catch {
      window.localStorage.removeItem("userSession");
    }
    setSessionReady(true);
  }, []);

  return (
    <AppContext.Provider
      value={{
        userData,
        setUser,
        facilityResponse,
        setFacilityResponse,
        sessionReady,
        theme,
        setTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useProvider() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useProvider must be used inside an AppProvider");
  }
  return context;
}
