'use client';
import { LanguageSwitcher } from '../language-switcher';
import { useT } from '@/i18n/provider';

import { useWorkspaceContext } from '../providers';
import { useWorkspace } from '@/lib/queries';
import { usePresentation } from '@/lib/presentation';
import { demoIdentities } from '@/lib/demo';
import { Loading, ErrorState, PageHeading } from '../common';
import s from '../ui.module.scss';
export function SettingsPage() {
  const { errorMessage } = usePresentation();

  const translate = useT();

  const { session, setDemoUser, timeZone, setTimeZone } = useWorkspaceContext();
  const query = useWorkspace();
  if (query.isPending) return <Loading />;
  if (query.error)
    return <ErrorState message={errorMessage(query.error)} retry={() => query.refetch()} />;
  const data = query.data;
  return (
    <div className={s.settings}>
      <PageHeading
        title={translate('navigation.settings')}
        description={translate('settings.yourWorkspaceContextAndDisplayPreferences')}
      />
      <div className={s.stack}>
        <section className={s.panel}>
          <div className={s.panelHeader}>
            <h2> {translate('matters.organization')} </h2>
          </div>
          <div className={s.body}>
            <dl className={s.definition}>
              <div>
                <dt> {translate('navigation.workspace')} </dt>
                <dd>{data.organization.name}</dd>
              </div>
              <div>
                <dt> {translate('settings.organizationReference')} </dt>
                <dd>{data.organization.id}</dd>
              </div>
              <div>
                <dt> {translate('settings.reportingCurrencyPreference')} </dt>
                <dd>
                  {data.organization.currency}{' '}
                  {translate('settings.metadataOnlyBillingIsNotConnected')}{' '}
                </dd>
              </div>
              <div>
                <dt> {translate('settings.organizationTimezone')} </dt>
                <dd>{data.organization.timeZone}</dd>
              </div>
            </dl>
          </div>
        </section>
        <section className={s.panel}>
          <div className={s.panelHeader}>
            <h2> {translate('settings.yourPreferences')} </h2>
          </div>
          <div className={s.form}>
            <div className={s.field}>
              <label htmlFor="timezone"> {translate('settings.displayTimezone')} </label>
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
                {' '}
                {translate('settings.changesHowTimestampsAreDisplayedCalendarTarget')}{' '}
              </small>
              <span className={s.success} role="status">
                {' '}
                {translate('settings.timestamps', { zone: timeZone })}
              </span>
            </div>
            <div className={s.field}>
              <LanguageSwitcher />
            </div>
          </div>
        </section>
        <section className={s.panel}>
          <div className={s.panelHeader}>
            <h2> {translate('settings.demoIdentity')} </h2>
          </div>
          <div className={s.form}>
            <div className={s.field}>
              <label htmlFor="demo-identity"> {translate('settings.previewWorkspaceAs')} </label>
              <select
                id="demo-identity"
                value={session.userId}
                onChange={(e) => setDemoUser(e.target.value)}
              >
                {demoIdentities.map((identity) => (
                  <option key={identity.id} value={identity.id}>
                    {translate(identity.label)}
                  </option>
                ))}
              </select>
            </div>
            <p className={s.notice}>
              {' '}
              {translate('settings.thisSwitchPreviewsInterfaceCapabilitiesItIs')}{' '}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
