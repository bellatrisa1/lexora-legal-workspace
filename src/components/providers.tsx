'use client';
import { createContext, useContext, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { SessionContext } from '@/lib/domain';
import { initialSession } from '@/lib/demo';
const WorkspaceContext = createContext<{
  session: SessionContext;
  setDemoUser: (id: string) => void;
  timeZone: string;
  setTimeZone: (zone: string) => void;
} | null>(null);
export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('Workspace provider is required');
  return context;
}
export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 20_000 } } }),
  );
  const [session, setSession] = useState(initialSession);
  const [timeZone, setTimeZone] = useState('UTC');
  return (
    <QueryClientProvider client={client}>
      <WorkspaceContext.Provider
        value={{
          session,
          setDemoUser: (id) => setSession((current) => ({ ...current, userId: id })),
          timeZone,
          setTimeZone,
        }}
      >
        {children}
      </WorkspaceContext.Provider>
    </QueryClientProvider>
  );
}
