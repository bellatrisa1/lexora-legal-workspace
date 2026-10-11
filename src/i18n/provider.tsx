'use client';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { isLocale, localeCookie, type Locale } from './config';
import { createTranslator, loadMessages, type Messages } from './messages';
const Context = createContext<{
  locale: Locale;
  messages: Messages;
  pending: boolean;
  error: boolean;
  changeLocale: (locale: Locale) => Promise<void>;
} | null>(null);
export function LocaleProvider({
  children,
  initialLocale,
  initialMessages,
}: {
  children: ReactNode;
  initialLocale: Locale;
  initialMessages: Messages;
}) {
  const [state, setState] = useState({ locale: initialLocale, messages: initialMessages });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  async function changeLocale(locale: Locale) {
    if (!isLocale(locale) || pending) return;
    setPending(true);
    setError(false);
    try {
      const messages = await loadMessages(locale);
      document.cookie = `${localeCookie}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
      document.documentElement.lang = locale;
      setState({ locale, messages });
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }
  return (
    <Context.Provider value={{ ...state, pending, error, changeLocale }}>
      {children}
    </Context.Provider>
  );
}
export function useLocale() {
  const value = useContext(Context);
  if (!value) throw new Error('Locale provider is required');
  return value;
}
export function useT() {
  const { locale, messages } = useLocale();
  return createTranslator(messages, locale);
}
