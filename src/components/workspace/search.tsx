'use client';
import Link from 'next/link';
import { useWorkspace } from '@/lib/queries';
import { errorMessage } from '@/lib/presentation';
import { Loading, ErrorState, PageHeading, Empty } from '../common';
import s from '../ui.module.scss';
export function SearchPage({ query: term }: { query: string }) {
  const query = useWorkspace();
  if (query.isPending) return <Loading />;
  if (query.error)
    return <ErrorState message={errorMessage(query.error)} retry={() => query.refetch()} />;
  const data = query.data;
  const search = term.trim().toLowerCase();
  const results = search
    ? [
        ...data.matters
          .filter((m) => `${m.title} ${m.reference}`.toLowerCase().includes(search))
          .map((m) => ({
            id: `m-${m.id}`,
            name: m.title,
            type: 'Matter',
            href: `/matters/${m.id}`,
          })),
        ...data.clients
          .filter((c) => `${c.name} ${c.contact}`.toLowerCase().includes(search))
          .map((c) => ({
            id: `c-${c.id}`,
            name: c.name,
            type: 'Client',
            href: `/clients/${c.id}`,
          })),
        ...data.documents
          .filter((d) => d.name.toLowerCase().includes(search))
          .map((d) => ({
            id: `d-${d.id}`,
            name: d.name,
            type: 'Document',
            href: `/matters/${d.matterId}?tab=documents`,
          })),
      ]
    : [];
  return (
    <>
      <PageHeading
        title="Search workspace"
        description={
          term
            ? `Results for “${term}”`
            : 'Find matters, clients and documents from the search bar.'
        }
      />
      <section className={s.panel}>
        {results.length ? (
          <ul className={s.list}>
            {results.map((result) => (
              <li key={result.id}>
                <span className={s.eyebrow}>{result.type}</span>
                <Link href={result.href} className={s.listTitle}>
                  {result.name} →
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Empty
            title="No matching results"
            text="Try a matter name, a client or a document title."
          />
        )}
      </section>
    </>
  );
}
