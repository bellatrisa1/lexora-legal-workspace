import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import { Shell } from '@/components/shell';
import './globals.css';
import { cookies, headers } from 'next/headers';
import { resolveLocale, localeCookie } from '@/i18n/config';
import { loadMessages } from '@/i18n/messages';
import { LocaleProvider } from '@/i18n/provider';
export const metadata: Metadata = {
  title: { default: 'Lexora — Global Legal Workspace', template: '%s | Lexora' },
  description: 'A connected workspace for legal teams, their clients and international matters.',
  robots: { index: false, follow: false },
};
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = resolveLocale(
    (await cookies()).get(localeCookie)?.value,
    (await headers()).get('accept-language') ?? '',
  );
  const messages = await loadMessages(locale);
  return (
    <html lang={locale}>
      <body>
        <LocaleProvider initialLocale={locale} initialMessages={messages}>
          <Providers>
            <Shell>{children}</Shell>
          </Providers>
        </LocaleProvider>
      </body>
    </html>
  );
}
