'use client';
import { useWorkspace } from '@/lib/queries';
import { errorMessage } from '@/lib/presentation';
import { Loading, ErrorState, PageHeading, Avatar } from '../common';
import s from '../ui.module.scss';
export function TeamPage() {
  const query = useWorkspace();
  if (query.isPending) return <Loading />;
  if (query.error)
    return <ErrorState message={errorMessage(query.error)} retry={() => query.refetch()} />;
  const data = query.data;
  return (
    <>
      <PageHeading
        title="Legal team"
        description={`The people working together at ${data.organization.name}.`}
      />
      <div className={s.grid}>
        {data.users
          .filter((u) => u.role !== 'client')
          .map((user) => (
            <article className={s.panel} key={user.id}>
              <div className={s.body}>
                <Avatar name={user.name} />
                <h2 style={{ marginTop: 18 }}>{user.name}</h2>
                <p className={s.small}>{user.title}</p>
                <hr className={s.divider} />
                <dl className={s.definition}>
                  <div>
                    <dt>Contact</dt>
                    <dd>{user.email}</dd>
                  </div>
                  <div>
                    <dt>Timezone</dt>
                    <dd>{user.timeZone}</dd>
                  </div>
                  <div>
                    <dt>Active matters in your view</dt>
                    <dd>
                      {
                        data.matters.filter(
                          (m) => m.teamIds.includes(user.id) && m.status !== 'closed',
                        ).length
                      }
                    </dd>
                  </div>
                </dl>
              </div>
            </article>
          ))}
      </div>
    </>
  );
}
