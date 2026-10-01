'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
import { useWorkspace, useFormat } from '@/lib/queries';
import { errorMessage } from '@/lib/presentation';
import { matterName } from '@/lib/selectors';
import { Loading, ErrorState, PageHeading, PriorityBadge, Empty } from '../common';
import s from '../ui.module.scss';
export function CalendarPage() {
  const query = useWorkspace();
  const format = useFormat();
  const [range, setRange] = useState('30');
  if (query.isPending) return <Loading />;
  if (query.error)
    return <ErrorState message={errorMessage(query.error)} retry={() => query.refetch()} />;
  const data = query.data;
  const today = new Date().toISOString().slice(0, 10);
  const until = new Date(today);
  until.setUTCDate(until.getUTCDate() + (range === 'all' ? 0 : Number(range)));
  const end = until.toISOString().slice(0, 10);
  const events = [
    ...data.matters
      .filter((m) => m.status !== 'closed')
      .map((m) => ({
        id: `matter-${m.id}`,
        matterId: m.id,
        title: m.title,
        date: m.targetDate,
        kind: 'Matter target date',
        priority: m.priority,
        tab: 'overview',
      })),
    ...data.tasks
      .filter((t) => t.status !== 'completed')
      .map((t) => ({
        id: `task-${t.id}`,
        matterId: t.matterId,
        title: t.title,
        date: t.dueDate,
        kind: 'Task deadline',
        priority: t.priority,
        tab: 'tasks',
      })),
  ]
    .filter((e) => range === 'all' || e.date <= end)
    .toSorted((a, b) => a.date.localeCompare(b.date));
  const dates = [...new Set(events.map((e) => e.date))];
  return (
    <>
      <PageHeading
        title="Calendar"
        description="Matter target dates and task deadlines in one working agenda."
      >
        <select
          className={s.select}
          aria-label="Calendar range"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          <option value="14">Next 14 days + overdue</option>
          <option value="30">Next 30 days + overdue</option>
          <option value="all">All scheduled work</option>
        </select>
      </PageHeading>
      <div className={s.stack}>
        {dates.length ? (
          dates.map((date) => (
            <section className={s.panel} key={date}>
              <div className={s.panelHeader}>
                <h2>
                  <CalendarDays size={14} /> {format.date(date)}
                </h2>
                {date < today && <span className={s.error}>Past target date</span>}
              </div>
              <ul className={s.list}>
                {events
                  .filter((e) => e.date === date)
                  .map((event) => (
                    <li key={event.id}>
                      <div className={s.row}>
                        <div>
                          <Link
                            href={`/matters/${event.matterId}?tab=${event.tab}`}
                            className={s.listTitle}
                          >
                            {event.title}
                          </Link>
                          <span className={s.small}>
                            {event.kind} · {matterName(data, event.matterId)}
                          </span>
                        </div>
                        <PriorityBadge priority={event.priority} />
                      </div>
                    </li>
                  ))}
              </ul>
            </section>
          ))
        ) : (
          <div className={s.panel}>
            <Empty
              title="Nothing scheduled in this range"
              text="Choose a wider date range to see future work."
            />
          </div>
        )}
      </div>
    </>
  );
}
