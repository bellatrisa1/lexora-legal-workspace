export const locales = ['en', 'ru', 'es', 'fr', 'it'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
export const localeCookie = 'portal_locale';
export const localeNames: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano',
};
export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && locales.some((locale) => locale === value);
}
export function resolveLocale(saved?: string, acceptLanguage = ''): Locale {
  if (isLocale(saved)) return saved;
  const preferences = acceptLanguage
    .split(',')
    .map((entry, index) => {
      const [tag, ...params] = entry.trim().split(';');
      const quality = params.find((param) => param.trim().startsWith('q='));
      return {
        locale: tag.toLowerCase().split('-')[0],
        quality: quality ? Number(quality.trim().slice(2)) : 1,
        index,
      };
    })
    .filter(({ quality }) => Number.isFinite(quality) && quality > 0 && quality <= 1)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);
  return (
    (preferences.find(({ locale }) => isLocale(locale))?.locale as Locale | undefined) ??
    defaultLocale
  );
}
