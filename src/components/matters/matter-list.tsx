'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import { useWorkspace } from '@/lib/queries';
import { matterStatuses } from '@/lib/domain';
import { errorMessage, statusLabels } from '@/lib/presentation';
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
        title="Matters"
        description="A clear view of every engagement, across clients and jurisdictions."
      >
        <Link href="/matters/new" className={s.button}>
          <Plus size={14} />
          Create matter
        </Link>
      </PageHeading>
      <div className={s.tabs} aria-label="Matter views">
        {[
          ['all', 'All matters'],
          ['active', 'Active'],
          ['in_review', 'In review'],
          ['client_action', 'Client action'],
          ['closed', 'Closed'],
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
      <section className={s.panel} aria-label="Matter list">
        <div className={s.toolbar}>
          <label className={s.search}>
            <Search size={15} />
            <input
              aria-label="Search matters"
              placeholder="Search by matter, client or reference…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <select
            className={s.select}
            aria-label="Sort matters"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="updated">Recently updated</option>
            <option value="date">Target date</option>
            <option value="name">Matter name</option>
            <option value="priority">Priority</option>
          </select>
        </div>
        <div className={s.toolbar}>
          <SlidersHorizontal size={14} />
          <div className={s.filterRow}>
            <select
              className={s.select}
              aria-label="Status filter"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="active">Active matters</option>
              {matterStatuses.map((value) => (
                <option key={value} value={value}>
                  {statusLabels[value]}
                </option>
              ))}
            </select>
            <select
              className={s.select}
              aria-label="Practice area filter"
              value={practice}
              onChange={(e) => setPractice(e.target.value)}
            >
              <option value="all">All practice areas</option>
              {data.practiceAreas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <select
              className={s.select}
              aria-label="Jurisdiction filter"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
            >
              <option value="all">All jurisdictions</option>
              {data.jurisdictions.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.name}
                </option>
              ))}
            </select>
            <select
              className={s.select}
              aria-label="Lead counsel filter"
              value={lead}
              onChange={(e) => setLead(e.target.value)}
            >
              <option value="all">All lead counsel</option>
              <option value="">Unassigned</option>
              {data.users
                .filter((u) => u.role === 'lawyer')
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
            </select>
            <button className={s.secondary} onClick={reset}>
              Reset filters
            </button>
          </div>
        </div>
        <MatterTable matters={visible} data={data} />
        <div className={s.tableFooter}>
          <span role="status">
            {visible.length} of {data.matters.length} matters
          </span>
          <span>All dates are target dates</span>
        </div>
      </section>
    </>
  );
}
