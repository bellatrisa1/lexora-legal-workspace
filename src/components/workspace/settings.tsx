'use client';
import { useWorkspaceContext } from '../providers';
import { useWorkspace } from '@/lib/queries';
import { errorMessage } from '@/lib/presentation';
import { demoIdentities } from '@/lib/demo';
import { Loading, ErrorState, PageHeading } from '../common';
import s from '../ui.module.scss';
export function SettingsPage() {
  const { session, setDemoUser, timeZone, setTimeZone } = useWorkspaceContext();
  const query = useWorkspace();
  if (query.isPending) return <Loading />;
  if (query.error)
    return <ErrorState message={errorMessage(query.error)} retry={() => query.refetch()} />;
  const data = query.data;
  return (
    <div className={s.settings}>
      <PageHeading title="Settings" description="Your workspace context and display preferences." />
      <div className={s.stack}>
        <section className={s.panel}>
          <div className={s.panelHeader}>
            <h2>Organization</h2>
          </div>
          <div className={s.body}>
            <dl className={s.definition}>
              <div>
                <dt>Workspace</dt>
                <dd>{data.organization.name}</dd>
              </div>
              <div>
                <dt>Organization reference</dt>
                <dd>{data.organization.id}</dd>
              </div>
              <div>
                <dt>Reporting currency preference</dt>
                <dd>{data.organization.currency} · metadata only; billing is not connected</dd>
              </div>
              <div>
                <dt>Organization timezone</dt>
                <dd>{data.organization.timeZone}</dd>
              </div>
            </dl>
          </div>
        </section>
        <section className={s.panel}>
          <div className={s.panelHeader}>
            <h2>Your preferences</h2>
          </div>
          <div className={s.form}>
            <div className={s.field}>
              <label htmlFor="timezone">Display timezone</label>
              <select id="timezone" value={timeZone} onChange={(e) => setTimeZone(e.target.value)}>
                {[
                  'UTC',
                  'Europe/London',
                  'America/New_York',
                  'Europe/Paris',
                  'Europe/Rome',
                  'Europe/Madrid',
                  'Europe/Berlin',
                  'Asia/Singapore',
                ].map((zone) => (
                  <option key={zone}>{zone}</option>
                ))}
              </select>
              <small>
                Changes how timestamps are displayed. Calendar target dates remain unchanged. This
                preference lasts for the current tab session.
              </small>
              <span className={s.success} role="status">
                Timestamps displayed in {timeZone}.
              </span>
            </div>
            <div className={s.field}>
              <label htmlFor="settings-language">Language</label>
              <select id="settings-language" disabled>
                <option>English</option>
              </select>
              <small>Russian, Spanish, French and Italian are planned for the next stage.</small>
            </div>
          </div>
        </section>
        <section className={s.panel}>
          <div className={s.panelHeader}>
            <h2>Demo identity</h2>
          </div>
          <div className={s.form}>
            <div className={s.field}>
              <label htmlFor="demo-identity">Preview workspace as</label>
              <select
                id="demo-identity"
                value={session.userId}
                onChange={(e) => setDemoUser(e.target.value)}
              >
                {demoIdentities.map((identity) => (
                  <option key={identity.id} value={identity.id}>
                    {identity.label}
                  </option>
                ))}
              </select>
            </div>
            <p className={s.notice}>
              This switch previews interface capabilities. It is not authentication, authorization
              or secure tenant isolation. The future API must enforce access independently.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
