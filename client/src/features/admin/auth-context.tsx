import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from 'react';

import type { AdminSession } from './types';

const storageKey = 'qflow-admin-session';

type AdminAuthContextValue = {
  session: AdminSession | null;
  setSession: (session: AdminSession | null) => void;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

function readStoredSession() {
  const stored = window.localStorage.getItem(storageKey);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as AdminSession;
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
}

export function AdminAuthProvider({ children }: PropsWithChildren) {
  const [session, setSessionState] = useState<AdminSession | null>(() => readStoredSession());

  useEffect(() => {
    if (!session) {
      window.localStorage.removeItem(storageKey);
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(session));
  }, [session]);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      session,
      setSession: setSessionState,
      logout: () => {
        setSessionState(null);
      }
    }),
    [session]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider.');
  }

  return context;
}
