import { createContext, useContext, useMemo, useState } from 'react';

const sharedTokens = {
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 28,
    xxl: 36
  },
  radius: {
    sm: 16,
    md: 22,
    lg: 30,
    pill: 999
  },
  typography: {
    body: 'Sora_400Regular',
    medium: 'Sora_500Medium',
    label: 'Sora_600SemiBold',
    title: 'Sora_700Bold',
    display: 'Sora_800ExtraBold'
  }
};

const lightPalette = {
  background: '#F3F7FC',
  surface: '#FFFFFF',
  surfaceElevated: '#EEF4FF',
  surfaceStrong: '#DCE8FF',
  footerSurface: '#FFFFFF',
  text: '#0F172A',
  textMuted: '#64748B',
  border: '#D4E0F5',
  primary: '#2563EB',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  primaryGradient: ['#1D4ED8', '#2563EB', '#60A5FA'],
  successGradient: ['#047857', '#10B981'],
  warningGradient: ['#B45309', '#F59E0B'],
  backgroundGlow: ['rgba(37, 99, 235, 0.24)', 'rgba(37, 99, 235, 0)'],
  backgroundGlowSoft: ['rgba(16, 185, 129, 0.14)', 'rgba(16, 185, 129, 0)'],
  orbPrimary: 'rgba(37, 99, 235, 0.12)',
  orbSecondary: 'rgba(16, 185, 129, 0.12)',
  shadow: 'rgba(15, 23, 42, 0.16)',
  skeleton: '#DCE8FF',
  icon: '#1E293B'
};

const darkPalette = {
  background: '#071120',
  surface: '#111C33',
  surfaceElevated: '#16243F',
  surfaceStrong: '#1D3158',
  footerSurface: '#0B1528',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  border: '#233657',
  primary: '#2563EB',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  primaryGradient: ['#0F172A', '#1D4ED8', '#2563EB'],
  successGradient: ['#064E3B', '#10B981'],
  warningGradient: ['#7C2D12', '#F59E0B'],
  backgroundGlow: ['rgba(96, 165, 250, 0.24)', 'rgba(96, 165, 250, 0)'],
  backgroundGlowSoft: ['rgba(59, 130, 246, 0.16)', 'rgba(59, 130, 246, 0)'],
  orbPrimary: 'rgba(37, 99, 235, 0.18)',
  orbSecondary: 'rgba(245, 158, 11, 0.12)',
  shadow: 'rgba(2, 6, 23, 0.42)',
  skeleton: '#223656',
  icon: '#E2E8F0'
};

function createTheme(mode) {
  const palette = mode === 'dark' ? darkPalette : lightPalette;

  return {
    ...sharedTokens,
    ...palette,
    mode,
    isDark: mode === 'dark'
  };
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('light');

  const value = useMemo(
    () => ({
      mode,
      theme: createTheme(mode),
      toggleTheme: () => {
        setMode((currentMode) => (currentMode === 'dark' ? 'light' : 'dark'));
      }
    }),
    [mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used within ThemeProvider.');
  }

  return context;
}
