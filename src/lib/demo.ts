import type { SessionContext } from './domain';
export const initialSession: SessionContext = { organizationId: 'org-lex', userId: 'olivia' };
export const demoIdentities = [
  { id: 'olivia', label: 'Lawyer' },
  { id: 'alex', label: 'Client' },
  { id: 'sophie', label: 'Admin' },
] as const;
