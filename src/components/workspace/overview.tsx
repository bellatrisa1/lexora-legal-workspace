'use client';
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
import { errorMessage } from '@/lib/presentation';
import { isActive, upcoming, matterName } from '@/lib/selectors';
import { Loading, ErrorState, PageHeading, Empty, PriorityBadge } from '../common';
import { MatterTable } from '../matters/matter-table';
import { ActivityFeed } from './activity-feed';
import s from '../ui.module.scss';
import o from './overview.module.scss';
export function Overview() {
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
      label: 'Active matters',
      value: data.matters.filter(isActive).length,
      detail: 'Across your workspace',
      icon: BriefcaseBusiness,
      href: '/matters?status=active',
    },
    {
      label: 'Awaiting review',
      value: data.matters.filter((m) => m.status === 'in_review').length,
      detail: 'Ready for your next step',
      icon: CircleCheck,
      href: '/matters?status=in_review',
    },
    {
      label: 'Upcoming deadlines',
      value: deadlines.length,
      detail: 'In the next 14 days',
      icon: Clock3,
      href: '/calendar',
    },
    {
      label: 'Client action required',
      value: data.matters.filter((m) => m.status === 'client_action').length,
      detail: 'Keep the conversation moving',
      icon: MessageSquare,
      href: '/matters?status=client_action',
    },
  ];
  return (
    <>
      <PageHeading
        title={`Good to see you, ${data.currentUser.name.split(' ')[0]}`}
        description="Your matters, people and priorities. All in one place."
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
            <h2>Recent matters</h2>
            <Link href="/matters" className={s.link}>
              View all matters <ArrowUpRight size={13} />
            </Link>
          </div>
          <MatterTable matters={recent} data={data} compact />
          <div className={s.tableFooter}>
            <span>Showing the latest {recent.length} matters</span>
            <span>Updated across your team</span>
          </div>
        </section>
        <section className={s.panel}>
          <div className={s.panelHeader}>
            <h2>Upcoming deadlines</h2>
            <CalendarDays size={15} color="#9298a5" />
          </div>
          {deadlines.length ? (
            <ul className={s.list}>
              {deadlines.slice(0, 4).map((m) => (
                <li key={m.id}>
                  <div className={o.deadline}>
                    <div className={o.dateBox}>
                      <small>
                        {new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' }).format(
                          new Date(m.targetDate),
                        )}
                      </small>
                      <strong>{new Date(m.targetDate).getUTCDate()}</strong>
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
            <Empty title="A clear schedule" text="No matter deadlines in the next 14 days." />
          )}
          <div className={o.bottomNote}>
            <Link href="/calendar" className={s.link}>
              Open calendar <ArrowUpRight size={13} />
            </Link>
          </div>
        </section>
      </div>
      <div className={o.bottomGrid}>
        <section className={s.panel}>
          <div className={s.panelHeader}>
            <h2>
              Tasks requiring attention <span className={s.small}> / {pending.length}</span>
            </h2>
            <Link href="/tasks" className={s.link}>
              View tasks <ArrowUpRight size={13} />
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
            <Empty title="All caught up" text="There are no outstanding tasks." />
          )}
        </section>
        <section className={s.panel}>
          <div className={s.panelHeader}>
            <h2>Recent activity</h2>
            <span className={s.small}>Across your workspace</span>
          </div>
          <ActivityFeed data={data} limit={3} />
        </section>
      </div>
    </>
  );
}
