'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Search, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useWorkspace, useFormat } from '@/lib/queries';
import { errorMessage } from '@/lib/presentation';
import { isActive } from '@/lib/selectors';
import { Loading, ErrorState, PageHeading, Empty } from '../common';
import { MatterTable } from '../matters/matter-table';
import s from '../ui.module.scss';
export function ClientsPage() {
  const query = useWorkspace();
  const [search, setSearch] = useState('');
  const format = useFormat();
  if (query.isPending) return <Loading />;
  if (query.error)
    return <ErrorState message={errorMessage(query.error)} retry={() => query.refetch()} />;
  const data = query.data;
  const clients = data.clients.filter((c) =>
    `${c.name} ${c.country} ${c.contact}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        title="Clients"
        description="The people and organizations behind your legal work."
      />
      <div className={s.toolbar} style={{ padding: '0 0 22px', border: 0 }}>
        <label className={s.search}>
          <Search size={15} />
          <input
            aria-label="Search clients"
            placeholder="Search clients, countries or contacts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <span className={s.small}>{clients.length} clients</span>
      </div>
      {clients.length ? (
        <div className={s.grid}>
          {clients.map((client) => {
            const related = data.matters.filter((m) => m.clientId === client.id);
            const updated = related.toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
              ?.updatedAt;
            return (
              <article className={s.panel} key={client.id}>
                <div className={s.body}>
                  <div className={s.row}>
                    <span className={s.clientMark}>{client.initials}</span>
                    <span className={s.small}>
                      {client.kind === 'individual' ? 'Individual' : 'Organization'}
                    </span>
                  </div>
                  <h2 style={{ marginTop: 20 }}>
                    <Link href={`/clients/${client.id}`}>{client.name}</Link>
                  </h2>
                  <p className={s.small}>
                    {client.industry} · {client.country}
                  </p>
                  <hr className={s.divider} />
                  <dl className={s.definition}>
                    <div>
                      <dt>Primary contact</dt>
                      <dd>{client.contact}</dd>
                    </div>
                    <div>
                      <dt>Active matters</dt>
                      <dd>{related.filter(isActive).length}</dd>
                    </div>
                    <div>
                      <dt>Latest matter update</dt>
                      <dd>{updated ? format.date(updated, 'short') : 'No activity yet'}</dd>
                    </div>
                  </dl>
                  <Link className={s.link} style={{ marginTop: 22 }} href={`/clients/${client.id}`}>
                    View client <ArrowUpRight size={13} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <Empty title="No clients found" text="Try a different client name, country or contact." />
      )}
    </>
  );
}
export function ClientDetail({ id }: { id: string }) {
  const query = useWorkspace();
  const format = useFormat();
  if (query.isPending) return <Loading />;
  if (query.error)
    return <ErrorState message={errorMessage(query.error)} retry={() => query.refetch()} />;
  const data = query.data;
  const client = data.clients.find((c) => c.id === id);
  if (!client)
    return (
      <Empty
        title="Client not found"
        text="This client is not available in your current demo workspace."
      />
    );
  return (
    <>
      <Link href="/clients" className={s.back}>
        <ArrowLeft size={13} />
        All clients
      </Link>
      <PageHeading title={client.name} description={`${client.industry} · ${client.country}`} />
      <div className={s.twoColumns}>
        <section className={s.panel}>
          <div className={s.panelHeader}>
            <h2>Client matters</h2>
          </div>
          <MatterTable
            matters={data.matters.filter((m) => m.clientId === id)}
            data={data}
            compact
          />
        </section>
        <aside className={s.panel}>
          <div className={s.body}>
            <h2>Client profile</h2>
            <dl className={s.definition}>
              <div>
                <dt>Client type</dt>
                <dd>{client.kind === 'individual' ? 'Individual' : 'Organization'}</dd>
              </div>
              <div>
                <dt>Primary contact</dt>
                <dd>{client.contact}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{client.email}</dd>
              </div>
              <div>
                <dt>Country</dt>
                <dd>{client.country}</dd>
              </div>
              <div>
                <dt>Client since</dt>
                <dd>{format.date(client.since)}</dd>
              </div>
              <div>
                <dt>Workspace</dt>
                <dd>{data.organization.name}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </>
  );
}
