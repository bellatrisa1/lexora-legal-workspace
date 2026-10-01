'use client';
import { useQuery } from '@tanstack/react-query';
import { useWorkspaceContext } from '@/components/providers';
import { api } from './api';
import { createFormatters } from '@/i18n/format';
export function useWorkspace() {
  const { session } = useWorkspaceContext();
  return useQuery({
    retryOnMount: false,
    queryKey: ['workspace', session.organizationId, session.userId],
    queryFn: () => api.getWorkspace(session),
  });
}
export function useFormat() {
  const { timeZone } = useWorkspaceContext();
  return createFormatters('en', timeZone);
}
