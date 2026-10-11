'use client';
import { useT } from '@/i18n/provider';

import { useState } from 'react';
import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
import { useWorkspace, useFormat } from '@/lib/queries';
import { usePresentation } from '@/lib/presentation';
import { matterName } from '@/lib/selectors';
import { Loading, ErrorState, PageHeading, PriorityBadge, Empty } from '../common';
import s from '../ui.module.scss';
export function CalendarPage() {
  const { errorMessage } = usePresentation();

  const translate = useT();

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
        kind: translate('calendar.matterTargetDate'),
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
        kind: translate('calendar.taskDeadline'),
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
        title={translate('navigation.calendar')}
        description={translate('calendar.matterTargetDatesAndTaskDeadlinesIn')}
      >
        <select
          className={s.select}
          aria-label={translate('calendar.calendarRange')}
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          <option value="14"> {translate('calendar.next14DaysOverdue')} </option>
          <option value="30"> {translate('calendar.next30DaysOverdue')} </option>
          <option value="all"> {translate('calendar.allScheduledWork')} </option>
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
                {date < today && (
                  <span className={s.error}> {translate('calendar.pastTargetDate')} </span>
                )}
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
              title={translate('calendar.nothingScheduledInThisRange')}
              text={translate('calendar.chooseAWiderDateRangeToSee')}
            />
          </div>
        )}
      </div>
    </>
  );
}
