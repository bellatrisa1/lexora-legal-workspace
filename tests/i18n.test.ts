import { describe, expect, it } from 'vitest';
import { defaultLocale, isLocale, locales, resolveLocale } from '../src/i18n/config';
import { createTranslator, loadMessages } from '../src/i18n/messages';
import { createFormatters } from '../src/i18n/format';
import { matterSchema, messageSchema, validationCode } from '../src/lib/domain';
import en from '../src/i18n/messages/en.json';

describe('Определение языка', () => {
  it('даёт cookie приоритет над языком браузера', () => {
    expect(resolveLocale('fr', 'ru-RU,en;q=0.8')).toBe('fr');
  });
  it('учитывает региональные варианты и вес предпочтений', () => {
    expect(resolveLocale(undefined, 'en;q=0.4,es-MX;q=0.9,ru;q=0')).toBe('es');
    expect(resolveLocale(undefined, 'fr-CA,it;q=0.9')).toBe('fr');
  });
  it('пропускает неверную cookie и неподдерживаемые языки', () => {
    expect(resolveLocale('de', 'ja-JP,ru-RU;q=0.7')).toBe('ru');
    expect(resolveLocale('invalid', 'ja-JP,zh;q=0.8')).toBe(defaultLocale);
    expect(resolveLocale()).toBe('en');
    expect(resolveLocale(undefined, 'fr;q=0,it;q=oops,es;q=2')).toBe('en');
    expect(isLocale('__proto__')).toBe(false);
  });
});
describe('Каталоги переводов', () => {
  for (const locale of locales) {
    it(`${locale}: совпадают пространства, ключи и параметры сообщений`, async () => {
      const messages = await loadMessages(locale);
      expect(Object.keys(messages).sort()).toEqual(Object.keys(en).sort());
      for (const namespace of Object.keys(en) as (keyof typeof en)[]) {
        expect(Object.keys(messages[namespace]).sort()).toEqual(Object.keys(en[namespace]).sort());
        for (const [key, template] of Object.entries(en[namespace])) {
          const translated = (messages[namespace] as Record<string, string>)[key];
          expect(translated.trim()).not.toBe('');
          expect(translated.match(/\{\w+\}/g)?.sort() ?? []).toEqual(
            template.match(/\{\w+\}/g)?.sort() ?? [],
          );
        }
      }
    });
  }
  it('возвращает английский текст при отсутствии ключа в каталоге', () => {
    const t = createTranslator({ common: { cancel: 'Annuler' } }, 'fr');
    expect(t('common.cancel')).toBe('Annuler');
    expect(t('common.retry')).toBe('Try again');
  });
  it('preserves message parameters and locale-specific number formatting', () => {
    const t = createTranslator({ common: { open: 'Open {name} · {count}' } }, 'fr');
    expect(t('common.open', { name: 'Client document', count: 4000 })).toContain(
      new Intl.NumberFormat('fr').format(4000),
    );
    expect(t('common.open', { name: 'Client document', count: 1 })).toContain('Client document');
  });
});
describe('Локализованное форматирование', () => {
  it('форматирует одну календарную дату для пяти языков', () => {
    const expected = {
      en: 'September 29, 2026',
      ru: '29 сентября 2026 г.',
      es: '29 de septiembre de 2026',
      fr: '29 septembre 2026',
      it: '29 settembre 2026',
    };
    for (const locale of locales)
      expect(createFormatters(locale).date('2026-09-29')).toBe(expected[locale]);
  });
  it('единая зона исключает сдвиги времени между сервером и браузером', () => {
    expect(createFormatters('en', 'America/New_York').dateTime('2026-09-29T10:15:00Z')).toContain(
      '6:15 AM',
    );
    expect(createFormatters('fr', 'Asia/Singapore').dateTime('2026-09-29T10:15:00Z')).toContain(
      '18:15',
    );
  });
  it('поддерживает числа и расширение на валюты', () => {
    expect(createFormatters('en').number(12345.67)).toBe('12,345.67');
    expect(createFormatters('it').number(12345.67)).toBe('12.345,67');
    expect(createFormatters('en').currency(100, 'USD')).toBe('$100.00');
  });
});
describe('Независимая от языка валидация', () => {
  it('оставляет код ошибки стабильным при переключении языка', async () => {
    const parsed = messageSchema.safeParse(' ');
    expect(parsed.success).toBe(false);
    if (parsed.success) throw new Error('Expected a validation error');
    const code = validationCode(parsed.error.issues[0].message);
    expect(code).toBe('commentRequired');
    expect(createTranslator(await loadMessages('en'), 'en')(`validation.${code}`)).toBe(
      'Enter a message',
    );
    expect(createTranslator(await loadMessages('it'), 'it')(`validation.${code}`)).toBe(
      'Inserisci un commento',
    );
  });
  it('не принимает несуществующую дату и русскую подпись вместо кода договора', () => {
    const input = {
      title: 'Valid request',
      clientId: 'asteria',
      practiceAreaId: 'ip',
      jurisdictionId: 'ew',
      leadCounselId: '',
      priority: 'medium',
      description: 'A sufficiently long description.',
      targetDate: '2099-02-30',
    };
    expect(matterSchema.safeParse(input).success).toBe(false);
    expect(
      matterSchema.safeParse({ ...input, targetDate: '2099-12-01', priority: 'High priority' })
        .success,
    ).toBe(false);
    expect(matterSchema.safeParse({ ...input, targetDate: '2099-12-01' }).success).toBe(true);
  });
});
