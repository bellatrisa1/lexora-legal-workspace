'use client';
import { useWorkspace, useFormat } from '@/lib/queries';
import { matterStatuses } from '@/lib/domain';
import { statusLabels, errorMessage } from '@/lib/presentation';
import { Loading, ErrorState, PageHeading } from '../common';
import s from '../ui.module.scss';
export function AnalyticsPage() {
  const query = useWorkspace();
  const format = useFormat();
  if (query.isPending) return <Loading />;
  if (query.error)
    return <ErrorState message={errorMessage(query.error)} retry={() => query.refetch()} />;
  const data = query.data;
  const groups = [
    {
      title: 'Matter status',
      items: matterStatuses.map((status) => ({
        name: statusLabels[status],
        count: data.matters.filter((m) => m.status === status).length,
      })),
    },
    {
      title: 'Practice areas',
      items: data.practiceAreas.map((area) => ({
        name: area.name,
        count: data.matters.filter((m) => m.practiceAreaId === area.id).length,
      })),
    },
    {
      title: 'Jurisdictions',
      items: data.jurisdictions.map((j) => ({
        name: j.name,
        count: data.matters.filter((m) => m.jurisdictionId === j.id).length,
      })),
    },
    {
      title: 'Lead counsel workload',
      items: data.users
        .filter((u) => u.role === 'lawyer')
        .map((user) => ({
          name: user.name,
          count: data.matters.filter((m) => m.leadCounselId === user.id && m.status !== 'closed')
            .length,
        })),
    },
  ];
  return (
    <>
      <PageHeading
        title="Workspace insights"
        description="Understand how your current work is distributed. No estimates or synthetic trends."
      />
      <div className={s.notice} style={{ marginBottom: 24 }}>
        Based on {format.number(data.matters.length)} matters visible to your demo identity. Lead
        counsel workload counts active matters only.
      </div>
      <div
        className={s.grid}
        style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))' }}
      >
        {groups.map((group) => (
          <section className={s.panel} key={group.title}>
            <div className={s.panelHeader}>
              <h2>{group.title}</h2>
            </div>
            <div className={s.body}>
              {group.items.map((item) => (
                <div key={item.name} style={{ marginBottom: 22 }}>
                  <div className={s.row}>
                    <span>{item.name}</span>
                    <strong>{format.number(item.count)}</strong>
                  </div>
                  <div className={s.bar} aria-hidden="true">
                    <span
                      style={{
                        width: `${data.matters.length ? (item.count / data.matters.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
