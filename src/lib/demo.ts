import type { MessageKey } from '@/i18n/messages';
import type { SessionContext } from './domain';
export const initialSession: SessionContext = { organizationId: 'org-lex', userId: 'olivia' };
export const demoIdentities = [
  { id: 'olivia', label: 'roles.lawyer' as MessageKey },
  { id: 'alex', label: 'matters.client' as MessageKey },
  { id: 'sophie', label: 'roles.admin' as MessageKey },
] as const;
