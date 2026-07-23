'use client';

import React, { createContext, useContext, useState } from 'react';
import { User, UserResponse } from '../models/user-model';
import { FacilityResponse } from '../models/facility-model';

type AppContextType = {
  userData: UserResponse,
  setUser: (data: UserResponse) => void,
  facilityResponse: FacilityResponse,
  setFacilityResponse: (res: FacilityResponse) => void
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUser] = useState<UserResponse>(UserResponse.fromJson({}));
  const [facilityResponse, setFacilityResponse] = useState<FacilityResponse>(FacilityResponse.fromJson({}));

  return (
    <AppContext.Provider value={{
        userData,
        setUser,
        facilityResponse,
        setFacilityResponse
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
