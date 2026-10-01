import type { Locale } from './config';
// Calendar dates are not instants. Timestamp display uses an explicit, independent timezone.
export const displayTimeZone = 'UTC';
export function createFormatters(locale: Locale, timeZone = displayTimeZone) {
  return {
    date: (value: string | Date, style: 'long' | 'short' = 'long') =>
      new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: style === 'long' ? 'long' : 'short',
        day: 'numeric',
        timeZone: 'UTC',
      }).format(new Date(value)),
    dateTime: (value: string | Date) =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone,
      }).format(new Date(value)),
    number: (value: number, options?: Intl.NumberFormatOptions) =>
      new Intl.NumberFormat(locale, options).format(value),
    currency: (value: number, currency: string) =>
      new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value),
  };
}
