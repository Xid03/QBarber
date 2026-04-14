import { createContext, useContext, useState } from 'react';
import { demoCredentials, demoOwner } from '../services/mockData';

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

export function AppProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSession());
  const [toasts, setToasts] = useState([]);

  const notify = ({ title, message, tone = 'brand' }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    setToasts((current) => [...current, { id, title, message, tone }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3400);
  };

  const login = ({ email, password, remember }) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail === demoCredentials.email && password === demoCredentials.password) {
      const nextSession = {
        ...demoOwner,
        remember,
        loggedInAt: new Date().toISOString()
      };

      setSession(nextSession);

      if (typeof window !== 'undefined') {
        if (remember) {
          window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
        } else {
          window.localStorage.removeItem(SESSION_KEY);
        }
      }

      notify({
        title: 'Preview unlocked',
        message: 'Admin dashboard loaded with demo data.',
        tone: 'success'
      });

      return { ok: true };
    }

    notify({
      title: 'Login failed',
      message: 'Use the demo credentials shown on the login card.',
      tone: 'danger'
    });

    return { ok: false, message: 'Invalid demo credentials' };
  };

  const logout = () => {
    setSession(null);

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(SESSION_KEY);
    }

    notify({
      title: 'Logged out',
      message: 'The admin preview session has been cleared.',
      tone: 'slate'
    });
  };

  return (
    <AppContext.Provider
      value={{
        session,
        isAuthenticated: Boolean(session),
        login,
        logout,
        notify,
        toasts
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }

  return context;
}
