'use client';
import { useLocale, useT } from '@/i18n/provider';
import { locales, localeNames, isLocale } from '@/i18n/config';
import s from './ui.module.scss';
export function LanguageSwitcher() {
  const { locale, pending, error, changeLocale } = useLocale();
  const translate = useT();
  return (
    <div>
      <select
        name="locale"
        className={s.select}
        style={{ width: 90 }}
        aria-label={translate('common.language')}
        value={locale}
        disabled={pending}
        onChange={(event) => {
          if (isLocale(event.target.value)) void changeLocale(event.target.value);
        }}
      >
        {locales.map((code) => (
          <option key={code} value={code}>
            {code.toUpperCase()} · {localeNames[code]}
          </option>
        ))}
      </select>
      {error && <span role="alert">{translate('common.languageError')}</span>}
    </div>
  );
}
