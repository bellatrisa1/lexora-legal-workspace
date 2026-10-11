'use client';
import { useT } from '@/i18n/provider';

import Link from 'next/link';
import {
  BriefcaseBusiness,
  Clock3,
  ArrowUpRight,
  CalendarDays,
  CircleCheck,
  MessageSquare,
  Circle,
} from 'lucide-react';
import { useWorkspace, useFormat } from '@/lib/queries';
import { usePresentation } from '@/lib/presentation';
import { isActive, upcoming, matterName } from '@/lib/selectors';
import { Loading, ErrorState, PageHeading, Empty, PriorityBadge } from '../common';
import { MatterTable } from '../matters/matter-table';
import { ActivityFeed } from './activity-feed';
import s from '../ui.module.scss';
import o from './overview.module.scss';
export function Overview() {
  const { errorMessage } = usePresentation();

  const translate = useT();

  const query = useWorkspace();
  const format = useFormat();
  if (query.isPending) return <Loading />;
  if (query.error)
    return <ErrorState message={errorMessage(query.error)} retry={() => query.refetch()} />;
  const data = query.data;
  const today = new Date().toISOString().slice(0, 10);
  const deadlines = upcoming(data, today);
  const pending = data.tasks
    .filter((t) => t.status !== 'completed')
    .toSorted((a, b) => a.dueDate.localeCompare(b.dueDate));
  const recent = data.matters
    .toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);
  const metrics = [
    {
      label: translate('matters.activeMatters'),
      value: data.matters.filter(isActive).length,
      detail: translate('overview.acrossYourWorkspace'),
      icon: BriefcaseBusiness,
      href: '/matters?status=active',
    },
    {
      label: translate('overview.awaitingReview'),
      value: data.matters.filter((m) => m.status === 'in_review').length,
      detail: translate('overview.readyForYourNextStep'),
      icon: CircleCheck,
      href: '/matters?status=in_review',
    },
    {
      label: translate('overview.upcomingDeadlines'),
      value: deadlines.length,
      detail: translate('overview.inTheNext14Days'),
      icon: Clock3,
      href: '/calendar',
    },
    {
      label: translate('overview.clientActionRequired'),
      value: data.matters.filter((m) => m.status === 'client_action').length,
      detail: translate('overview.keepTheConversationMoving'),
      icon: MessageSquare,
      href: '/matters?status=client_action',
    },
  ];
  return (
    <>
      <PageHeading
        title={translate('overview.greeting', { name: data.currentUser.name.split(' ')[0] })}
        description={translate('overview.yourMattersPeopleAndPrioritiesAllIn')}
      >
        <span className={o.dateNow}>
          <CalendarDays size={14} />
          {format.date(today)}
        </span>
      </PageHeading>
      <div className={o.metrics}>
        {metrics.map(({ label, value, detail, icon: Icon, href }) => (
          <Link className={o.metric} href={href} key={label}>
            <header>
              {label}
              <span className={o.icon}>
                <Icon size={15} />
              </span>
            </header>
            <strong>{format.number(value, { minimumIntegerDigits: 2 })}</strong>
            <small>{detail}</small>
          </Link>
        ))}
      </div>
      <div className={o.mainGrid}>
        <section className={s.panel}>
          <div className={s.panelHeader}>
            <h2> {translate('overview.recentMatters')} </h2>
            <Link href="/matters" className={s.link}>
              {' '}
              {translate('overview.viewAllMatters')} <ArrowUpRight size={13} />
            </Link>
          </div>
          <MatterTable matters={recent} data={data} compact />
          <div className={s.tableFooter}>
            <span> {translate('overview.recentCount', { count: recent.length })}</span>
            <span> {translate('overview.updatedAcrossYourTeam')} </span>
          </div>
        </section>
        <section className={s.panel}>
          <div className={s.panelHeader}>
            <h2> {translate('overview.upcomingDeadlines')} </h2>
            <CalendarDays size={15} color="#9298a5" />
          </div>
          {deadlines.length ? (
            <ul className={s.list}>
              {deadlines.slice(0, 4).map((m) => (
                <li key={m.id}>
                  <div className={o.deadline}>
                    <div className={o.dateBox}>
                      <small>{format.month(m.targetDate)}</small>
                      <strong>{format.day(m.targetDate)}</strong>
                    </div>
                    <div>
                      <Link className={s.listTitle} href={`/matters/${m.id}`}>
                        {m.title}
                      </Link>
                      <span className={s.small}>
                        {data.clients.find((c) => c.id === m.clientId)?.name}
                      </span>
                      <div style={{ marginTop: 8 }}>
                        <PriorityBadge priority={m.priority} />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty
              title={translate('overview.aClearSchedule')}
              text={translate('overview.noMatterDeadlinesInTheNext14')}
            />
          )}
          <div className={o.bottomNote}>
            <Link href="/calendar" className={s.link}>
              {' '}
              {translate('overview.openCalendar')} <ArrowUpRight size={13} />
            </Link>
          </div>
        </section>
      </div>
      <div className={o.bottomGrid}>
        <section className={s.panel}>
          <div className={s.panelHeader}>
            <h2>
              {' '}
              {translate('overview.tasksRequiringAttention')}{' '}
              <span className={s.small}> / {pending.length}</span>
            </h2>
            <Link href="/tasks" className={s.link}>
              {' '}
              {translate('overview.viewTasks')} <ArrowUpRight size={13} />
            </Link>
          </div>
          {pending.length ? (
            <ul className={s.list}>
              {pending.slice(0, 3).map((task) => (
                <li key={task.id}>
                  <div className={o.task}>
                    <Circle size={15} className={o.taskIcon} />
                    <div style={{ flex: 1 }}>
                      <Link className={s.listTitle} href={`/matters/${task.matterId}?tab=tasks`}>
                        {task.title}
                      </Link>
                      <div className={s.row}>
                        <span className={s.small}>{matterName(data, task.matterId)}</span>
                        <span className={s.small}>{format.date(task.dueDate, 'short')}</span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty
              title={translate('overview.allCaughtUp')}
              text={translate('overview.thereAreNoOutstandingTasks')}
            />
          )}
        </section>
        <section className={s.panel}>
          <div className={s.panelHeader}>
            <h2> {translate('matters.recentActivity')} </h2>
            <span className={s.small}> {translate('overview.acrossYourWorkspace')} </span>
          </div>
          <ActivityFeed data={data} limit={3} />
        </section>
      </div>
    </>
  );
}
