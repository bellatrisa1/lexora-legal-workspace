import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import { Shell } from '@/components/shell';
import './globals.css';
export const metadata: Metadata = {
  title: { default: 'Lexora — Global Legal Workspace', template: '%s | Lexora' },
  description: 'A connected workspace for legal teams, their clients and international matters.',
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}
