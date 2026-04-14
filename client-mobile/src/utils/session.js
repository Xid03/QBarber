import { createContext, useContext, useMemo, useState } from 'react';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const value = useMemo(
    () => ({
      isLoggedIn,
      loginDemo: () => setIsLoggedIn(true),
      logout: () => setIsLoggedIn(false)
    }),
    [isLoggedIn]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useClientSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useClientSession must be used within SessionProvider.');
  }

  return context;
}
