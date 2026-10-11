'use client';
import { useT } from '@/i18n/provider';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import { useWorkspace } from '@/lib/queries';
import { matterStatuses } from '@/lib/domain';
import { usePresentation } from '@/lib/presentation';
import { Loading, ErrorState, PageHeading } from '../common';
import { MatterTable } from './matter-table';
import s from '../ui.module.scss';
export function MatterList({
  initialSearch = '',
  initialStatus = 'all',
}: {
  initialSearch?: string;
  initialStatus?: string;
}) {
  const { errorMessage, statusLabels } = usePresentation();

  const translate = useT();

  const query = useWorkspace();
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const [practice, setPractice] = useState('all');
  const [jurisdiction, setJurisdiction] = useState('all');
  const [lead, setLead] = useState('all');
  const [sort, setSort] = useState('updated');
  if (query.isPending) return <Loading />;
  if (query.error)
    return <ErrorState message={errorMessage(query.error)} retry={() => query.refetch()} />;
  const data = query.data;
  const visible = data.matters
    .filter(
      (m) =>
        (status === 'all' || (status === 'active' ? m.status !== 'closed' : m.status === status)) &&
        (practice === 'all' || m.practiceAreaId === practice) &&
        (jurisdiction === 'all' || m.jurisdictionId === jurisdiction) &&
        (lead === 'all' || m.leadCounselId === lead) &&
        `${m.title} ${m.reference} ${data.clients.find((c) => c.id === m.clientId)?.name}`
          .toLowerCase()
          .includes(search.trim().toLowerCase()),
    )
    .toSorted((a, b) =>
      sort === 'date'
        ? a.targetDate.localeCompare(b.targetDate)
        : sort === 'name'
          ? a.title.localeCompare(b.title)
          : sort === 'priority'
            ? ['high', 'medium', 'low'].indexOf(a.priority) -
              ['high', 'medium', 'low'].indexOf(b.priority)
            : b.updatedAt.localeCompare(a.updatedAt),
    );
  function reset() {
    setSearch('');
    setStatus('all');
    setPractice('all');
    setJurisdiction('all');
    setLead('all');
    setSort('updated');
  }
  return (
    <>
      <PageHeading
        title={translate('matters.matters')}
        description={translate('matters.aClearViewOfEveryEngagementAcross')}
      >
        <Link href="/matters/new" className={s.button}>
          <Plus size={14} /> {translate('matters.createMatter')}{' '}
        </Link>
      </PageHeading>
      <div className={s.tabs} aria-label={translate('matters.matterViews')}>
        {[
          ['all', translate('matters.allMatters')],
          ['active', translate('matters.active')],
          ['in_review', translate('matters.inReview')],
          ['client_action', translate('matters.clientAction')],
          ['closed', translate('matters.closed')],
        ].map(([value, label]) => (
          <button
            key={value}
            className={status === value ? s.selected : ''}
            onClick={() => setStatus(value)}
            aria-pressed={status === value}
          >
            {label}
          </button>
        ))}
      </div>
      <section className={s.panel} aria-label={translate('matters.matterList')}>
        <div className={s.toolbar}>
          <label className={s.search}>
            <Search size={15} />
            <input
              aria-label={translate('matters.searchMatters')}
              placeholder={translate('matters.searchByMatterClientOrReference')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <select
            className={s.select}
            aria-label={translate('matters.sortMatters')}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="updated"> {translate('matters.recentlyUpdated')} </option>
            <option value="date"> {translate('matters.targetDate')} </option>
            <option value="name"> {translate('matters.matterName')} </option>
            <option value="priority"> {translate('matters.priority')} </option>
          </select>
        </div>
        <div className={s.toolbar}>
          <SlidersHorizontal size={14} />
          <div className={s.filterRow}>
            <select
              className={s.select}
              aria-label={translate('matters.statusFilter')}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all"> {translate('matters.allStatuses')} </option>
              <option value="active"> {translate('matters.activeMatters')} </option>
              {matterStatuses.map((value) => (
                <option key={value} value={value}>
                  {statusLabels[value]}
                </option>
              ))}
            </select>
            <select
              className={s.select}
              aria-label={translate('matters.practiceAreaFilter')}
              value={practice}
              onChange={(e) => setPractice(e.target.value)}
            >
              <option value="all"> {translate('matters.allPracticeAreas')} </option>
              {data.practiceAreas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <select
              className={s.select}
              aria-label={translate('matters.jurisdictionFilter')}
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
            >
              <option value="all"> {translate('matters.allJurisdictions')} </option>
              {data.jurisdictions.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.name}
                </option>
              ))}
            </select>
            <select
              className={s.select}
              aria-label={translate('matters.leadCounselFilter')}
              value={lead}
              onChange={(e) => setLead(e.target.value)}
            >
              <option value="all"> {translate('matters.allLeadCounsel')} </option>
              <option value=""> {translate('matters.unassigned')} </option>
              {data.users
                .filter((u) => u.role === 'lawyer')
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
            </select>
            <button className={s.secondary} onClick={reset}>
              {' '}
              {translate('matters.resetFilters')}{' '}
            </button>
          </div>
        </div>
        <MatterTable matters={visible} data={data} />
        <div className={s.tableFooter}>
          <span role="status">
            {translate('matters.resultCount', {
              count: visible.length,
              total: data.matters.length,
            })}
          </span>
          <span> {translate('matters.allDatesAreTargetDates')} </span>
        </div>
      </section>
    </>
  );
}
