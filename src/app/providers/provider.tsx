'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserResponse } from '../models/user-model';
import { FacilityResponse } from '../models/facility-model';

type AppContextType = {
  userData: UserResponse,
  setUser: (data: UserResponse) => void,
  facilityResponse: FacilityResponse,
  setFacilityResponse: (res: FacilityResponse) => void,
  sessionReady: boolean
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUser] = useState<UserResponse>(UserResponse.fromJson({}));
  const [facilityResponse, setFacilityResponse] = useState<FacilityResponse>(FacilityResponse.fromJson({}));
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('userSession');
      if (stored) setUser(UserResponse.fromJson(JSON.parse(stored)));
    } catch {
      window.localStorage.removeItem('userSession');
    }
    setSessionReady(true);
  }, []);

  return (
    <AppContext.Provider value={{
        userData,
        setUser,
        facilityResponse,
        setFacilityResponse,
        sessionReady
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useProvider() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useProvider must be used inside an AppProvider');
  }
  return context;
}
