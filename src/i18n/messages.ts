import english from './messages/en.json';
import type { Locale } from './config';
export type Messages = typeof english;
export type Namespace = keyof Messages;
export type MessageKey = {
  [N in Namespace]: `${N}.${Extract<keyof Messages[N], string>}`;
}[Namespace];
export type MessageValues = Record<string, string | number>;
export type Translator = (key: MessageKey, values?: MessageValues) => string;
export type PartialMessages = { [N in Namespace]?: Partial<Messages[N]> };
const loaders: Record<Locale, () => Promise<Messages>> = {
  en: async () => english,
  ru: async () => (await import('./messages/ru.json')).default,
  es: async () => (await import('./messages/es.json')).default,
  fr: async () => (await import('./messages/fr.json')).default,
  it: async () => (await import('./messages/it.json')).default,
};
export function loadMessages(locale: Locale): Promise<Messages> {
  return loaders[locale]();
}
export function createTranslator(messages: PartialMessages, locale: Locale): Translator {
  return (key, values = {}) => {
    const [namespace, name] = key.split('.') as [Namespace, string];
    const translated = messages[namespace] as Record<string, string> | undefined;
    const fallback = english[namespace] as Record<string, string>;
    const template = translated?.[name] || fallback[name];
    return template.replace(/\{(\w+)\}/g, (placeholder, name: string) => {
      const value = values[name];
      return typeof value === 'number'
        ? new Intl.NumberFormat(locale).format(value)
        : (value ?? placeholder);
    });
  };
}
