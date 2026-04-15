'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface StoreInfo {
  siteId: number | null;
  storeName: string;
  displayName: string;
  isLive: string;
}

interface StoreContextType {
  store: StoreInfo;
  setStore: (siteId: number, name?: string, displayName?: string, isLive?: string) => void;
  clearStore: () => void;
  /** Convenience: returns the current siteId or 0 if not set */
  siteId: number;
}

const defaultStore: StoreInfo = {
  siteId: null,
  storeName: '',
  displayName: '',
  isLive: 'n',
};

const StoreContext = createContext<StoreContextType>({
  store: defaultStore,
  setStore: () => {},
  clearStore: () => {},
  siteId: 0,
});

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store, setStoreState] = useState<StoreInfo>(defaultStore);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('current_store');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.siteId) {
          setStoreState(parsed);
        }
      }
    } catch {}
  }, []);

  const setStore = useCallback((siteId: number, name?: string, displayName?: string, isLive?: string) => {
    const info: StoreInfo = {
      siteId,
      storeName: name || '',
      displayName: displayName || '',
      isLive: isLive || 'n',
    };
    setStoreState(info);
    try {
      localStorage.setItem('current_store', JSON.stringify(info));
    } catch {}
  }, []);

  const clearStore = useCallback(() => {
    setStoreState(defaultStore);
    try {
      localStorage.removeItem('current_store');
    } catch {}
  }, []);

  return (
    <StoreContext.Provider value={{
      store,
      setStore,
      clearStore,
      siteId: store.siteId || 0,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}

export default StoreContext;
