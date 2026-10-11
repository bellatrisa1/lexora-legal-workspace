'use client';
import { useLocale } from '@/i18n/provider';
import { useQuery } from '@tanstack/react-query';
import { useWorkspaceContext } from '@/components/providers';
import { api } from './api';
import { createFormatters } from '@/i18n/format';
export function useWorkspace() {
  const { session } = useWorkspaceContext();
  const { messages } = useLocale();
  return useQuery({
    retryOnMount: false,
    select: (data) => ({
      ...data,
      jurisdictions: data.jurisdictions.map((item) => ({
        ...item,
        name: messages.references[item.id as keyof typeof messages.references] ?? item.name,
      })),
      practiceAreas: data.practiceAreas.map((item) => ({
        ...item,
        name: messages.references[item.id as keyof typeof messages.references] ?? item.name,
      })),
    }),
    queryKey: ['workspace', session.organizationId, session.userId],
    queryFn: () => api.getWorkspace(session),
  });
}
export function useFormat() {
  const { timeZone } = useWorkspaceContext();
  const { locale } = useLocale();
  return createFormatters(locale, timeZone);
}
