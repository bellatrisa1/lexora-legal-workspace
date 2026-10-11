'use client';
import { useT } from '@/i18n/provider';

import Link from 'next/link';
import { useState } from 'react';
import { Search, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useWorkspace, useFormat } from '@/lib/queries';
import { usePresentation } from '@/lib/presentation';
import { isActive } from '@/lib/selectors';
import { Loading, ErrorState, PageHeading, Empty } from '../common';
import { MatterTable } from '../matters/matter-table';
import s from '../ui.module.scss';
export function ClientsPage() {
  const { errorMessage } = usePresentation();

  const translate = useT();

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
        title={translate('navigation.clients')}
        description={translate('clients.thePeopleAndOrganizationsBehindYourLegal')}
      />
      <div className={s.toolbar} style={{ padding: '0 0 22px', border: 0 }}>
        <label className={s.search}>
          <Search size={15} />
          <input
            aria-label={translate('clients.searchClients')}
            placeholder={translate('clients.searchClientsCountriesOrContacts')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <span className={s.small}>{translate('clients.count', { count: clients.length })}</span>
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
                      {client.kind === 'individual'
                        ? translate('clients.individual')
                        : translate('matters.organization')}
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
                      <dt> {translate('clients.primaryContact')} </dt>
                      <dd>{client.contact}</dd>
                    </div>
                    <div>
                      <dt> {translate('matters.activeMatters')} </dt>
                      <dd>{related.filter(isActive).length}</dd>
                    </div>
                    <div>
                      <dt> {translate('clients.latestMatterUpdate')} </dt>
                      <dd>
                        {updated
                          ? format.date(updated, 'short')
                          : translate('activityfeed.noActivityYet')}
                      </dd>
                    </div>
                  </dl>
                  <Link className={s.link} style={{ marginTop: 22 }} href={`/clients/${client.id}`}>
                    {' '}
                    {translate('clients.viewClient')} <ArrowUpRight size={13} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <Empty
          title={translate('clients.noClientsFound')}
          text={translate('clients.tryADifferentClientNameCountryOr')}
        />
      )}
    </>
  );
}
export function ClientDetail({ id }: { id: string }) {
  const { errorMessage } = usePresentation();

  const translate = useT();

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
        title={translate('clients.clientNotFound')}
        text={translate('clients.thisClientIsNotAvailableInYour')}
      />
    );
  return (
    <>
      <Link href="/clients" className={s.back}>
        <ArrowLeft size={13} /> {translate('clients.allClients')}{' '}
      </Link>
      <PageHeading title={client.name} description={`${client.industry} · ${client.country}`} />
      <div className={s.twoColumns}>
        <section className={s.panel}>
          <div className={s.panelHeader}>
            <h2> {translate('clients.clientMatters')} </h2>
          </div>
          <MatterTable
            matters={data.matters.filter((m) => m.clientId === id)}
            data={data}
            compact
          />
        </section>
        <aside className={s.panel}>
          <div className={s.body}>
            <h2> {translate('clients.clientProfile')} </h2>
            <dl className={s.definition}>
              <div>
                <dt> {translate('clients.clientType')} </dt>
                <dd>
                  {client.kind === 'individual'
                    ? translate('clients.individual')
                    : translate('matters.organization')}
                </dd>
              </div>
              <div>
                <dt> {translate('clients.primaryContact')} </dt>
                <dd>{client.contact}</dd>
              </div>
              <div>
                <dt> {translate('clients.email')} </dt>
                <dd>{client.email}</dd>
              </div>
              <div>
                <dt> {translate('clients.country')} </dt>
                <dd>{client.country}</dd>
              </div>
              <div>
                <dt> {translate('clients.clientSince')} </dt>
                <dd>{format.date(client.since)}</dd>
              </div>
              <div>
                <dt> {translate('navigation.workspace')} </dt>
                <dd>{data.organization.name}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </>
  );
}
