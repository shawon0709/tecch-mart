import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { useEffect } from 'react';
import { NotificationProvider } from '@/contexts/NotificationContext';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Check for dark mode preference
    const isDark = localStorage.getItem('darkMode') === 'true';
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

    return (
    <NotificationProvider>
      <Component {...pageProps} />
    </NotificationProvider>
  );
}