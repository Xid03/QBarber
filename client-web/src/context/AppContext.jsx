import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authAPI, setWebAuthToken } from '../services/api';

const SESSION_KEY = 'qbarber.admin.session';
const AppContext = createContext(null);

function readStoredSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const saved = window.localStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function buildSession(payload, remember = true) {
  const user = payload?.user || null;
  const shop = payload?.shop || null;
  const avatar = user?.name
    ? user.name
        .split(' ')
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join('')
        .toUpperCase()
    : 'QB';

  return {
    token: payload?.token || null,
    user,
    shop,
    remember,
    loggedInAt: new Date().toISOString(),
    name: user?.name || 'QBarber Admin',
    role: user?.role ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)}` : 'Admin',
    shopName: shop?.name || 'QBarber',
    branch: shop?.branches?.[0]?.name || shop?.name || 'Main branch',
    email: user?.email || '',
    avatar
  };
}

export function AppProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSession());
  const [toasts, setToasts] = useState([]);
  const [isBooting, setIsBooting] = useState(() => Boolean(readStoredSession()?.token));

  const notify = ({ title, message, tone = 'brand' }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    setToasts((current) => [...current, { id, title, message, tone }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3400);
  };

  const persistSession = (nextSession) => {
    setSession(nextSession);
    setWebAuthToken(nextSession?.token || null);

    if (typeof window === 'undefined') {
      return;
    }

    if (nextSession?.remember && nextSession?.token) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    } else {
      window.localStorage.removeItem(SESSION_KEY);
    }
  };

  const clearSession = () => {
    persistSession(null);
  };

  useEffect(() => {
    if (!session?.token) {
      setWebAuthToken(null);
      setIsBooting(false);
      return;
    }

    setWebAuthToken(session.token);

    let cancelled = false;

    authAPI
      .me()
      .then((response) => {
        if (cancelled) {
          return;
        }

        persistSession(buildSession({ ...response.data, token: session.token }, session.remember !== false));
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        clearSession();
      })
      .finally(() => {
        if (!cancelled) {
          setIsBooting(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async ({ email, password, remember }) => {
    try {
      const response = await authAPI.login({ email, password });
      const nextSession = buildSession(response.data, remember);
      persistSession(nextSession);

      notify({
        title: 'Signed in',
        message: 'Admin dashboard connected to the live QBarber backend.',
        tone: 'success'
      });

      return { ok: true };
    } catch (error) {
      notify({
        title: 'Login failed',
        message: error.message,
        tone: 'danger'
      });

      return { ok: false, message: error.message };
    }
  };

  const logout = () => {
    clearSession();

    notify({
      title: 'Logged out',
      message: 'The admin session has been cleared from this browser.',
      tone: 'slate'
    });
  };

  const refreshSession = async () => {
    if (!session?.token) {
      return null;
    }

    const response = await authAPI.me();
    const nextSession = buildSession({ ...response.data, token: session.token }, session.remember !== false);
    persistSession(nextSession);
    return nextSession;
  };

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session?.token),
      isBooting,
      login,
      logout,
      notify,
      refreshSession,
      toasts
    }),
    [session, isBooting, toasts]
  );

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }

  return context;
}
