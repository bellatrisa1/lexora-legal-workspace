'use client';
import { useT } from '@/i18n/provider';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Globe2, BriefcaseBusiness } from 'lucide-react';
import { api } from '@/lib/api';
import { matterStatuses, type MatterStatus } from '@/lib/domain';
import { useWorkspace, useFormat } from '@/lib/queries';
import { capabilities } from '@/lib/policy';
import { usePresentation } from '@/lib/presentation';
import { useWorkspaceContext } from '../providers';
import { Loading, ErrorState, Empty, Avatar, Badge, PriorityBadge } from '../common';
import { DocumentList } from '../workspace/documents';
import { TaskList } from '../workspace/tasks';
import { ActivityFeed } from '../workspace/activity-feed';
import { MatterMessages } from './matter-messages';
import s from '../ui.module.scss';
const sections = ['overview', 'documents', 'tasks', 'messages', 'activity'] as const;
type Section = (typeof sections)[number];
export function MatterDetail({ id, initialTab = 'overview' }: { id: string; initialTab?: string }) {
  const { errorMessage, statusLabels } = usePresentation();

  const translate = useT();

  const query = useWorkspace();
  const format = useFormat();
  const { session } = useWorkspaceContext();
  const cache = useQueryClient();
  const [section, setSection] = useState<Section>(
    sections.find((s) => s === initialTab) ?? 'overview',
  );
  const mutation = useMutation({
    mutationFn: (status: MatterStatus) => api.changeStatus(session, id, status),
    onSuccess: () => cache.invalidateQueries({ queryKey: ['workspace'] }),
  });
  if (query.isPending) return <Loading />;
  if (query.error)
    return <ErrorState message={errorMessage(query.error)} retry={() => query.refetch()} />;
  const data = query.data;
  const matter = data.matters.find((m) => m.id === id);
  if (!matter)
    return (
      <Empty
        title={translate('matters.matterNotFound')}
        text={translate('matters.thisMatterIsUnavailableInYourCurrent')}
      >
        <Link href="/matters" className={s.secondary}>
          {' '}
          {translate('matters.backToMatters')}{' '}
        </Link>
      </Empty>
    );
  const client = data.clients.find((c) => c.id === matter.clientId);
  const lead = data.users.find((u) => u.id === matter.leadCounselId);
  const can = capabilities(data.currentUser);
  return (
    <>
      <Link href="/matters" className={s.back}>
        <ArrowLeft size={13} /> {translate('matters.allMatters')}{' '}
      </Link>
      <div className={s.heading}>
        <div>
          <div className={s.eyebrow}>
            {matter.reference} · {data.organization.name}
          </div>
          <h1>{matter.title}</h1>
          <div className={s.detailMeta}>
            <Link href={`/clients/${matter.clientId}`}>
              <BriefcaseBusiness size={12} /> {client?.name}
            </Link>
            <span>
              <Globe2 size={12} />{' '}
              {data.jurisdictions.find((j) => j.id === matter.jurisdictionId)?.name}
            </span>
          </div>
        </div>
        <div className={s.actions}>
          <PriorityBadge priority={matter.priority} />
          <Badge status={matter.status} />
        </div>
      </div>
      <div className={s.tabs} role="tablist" aria-label={translate('matters.matterSections')}>
        {sections.map((name, index) => (
          <button
            key={name}
            id={`tab-${name}`}
            role="tab"
            aria-selected={section === name}
            aria-controls="matter-panel"
            tabIndex={section === name ? 0 : -1}
            className={section === name ? s.selected : ''}
            onClick={() => setSection(name)}
            onKeyDown={(event) => {
              const next =
                event.key === 'ArrowRight'
                  ? (index + 1) % sections.length
                  : event.key === 'ArrowLeft'
                    ? (index + sections.length - 1) % sections.length
                    : event.key === 'Home'
                      ? 0
                      : event.key === 'End'
                        ? sections.length - 1
                        : -1;
              if (next >= 0) {
                event.preventDefault();
                setSection(sections[next]);
                document.getElementById(`tab-${sections[next]}`)?.focus();
              }
            }}
          >
            {translate(
              (
                {
                  overview: 'navigation.overview',
                  documents: 'navigation.documents',
                  tasks: 'navigation.tasks',
                  messages: 'navigation.messages',
                  activity: 'home.activity',
                } as const
              )[name],
            )}
            {name === 'documents' && ` (${data.documents.filter((d) => d.matterId === id).length})`}
          </button>
        ))}
      </div>
      <div className={s.twoColumns}>
        <section
          id="matter-panel"
          role="tabpanel"
          aria-labelledby={`tab-${section}`}
          className={s.stack}
        >
          {section === 'overview' && (
            <>
              <div className={s.panel}>
                <div className={s.panelHeader}>
                  <h2> {translate('matters.scopeContext')} </h2>
                </div>
                <div className={s.body}>
                  <p>{matter.description}</p>
                  <hr className={s.divider} />
                  <dl className={s.definition}>
                    <div>
                      <dt> {translate('matters.practiceArea')} </dt>
                      <dd>
                        {data.practiceAreas.find((p) => p.id === matter.practiceAreaId)?.name}
                      </dd>
                    </div>
                    <div>
                      <dt> {translate('matters.client')} </dt>
                      <dd>
                        <Link href={`/clients/${matter.clientId}`} className={s.link}>
                          {client?.name} →
                        </Link>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
              <div className={s.panel}>
                <div className={s.panelHeader}>
                  <h2> {translate('matters.recentActivity')} </h2>
                  <button className={s.secondary} onClick={() => setSection('activity')}>
                    {' '}
                    {translate('matters.viewAll')}{' '}
                  </button>
                </div>
                <ActivityFeed data={data} matterId={id} limit={3} />
              </div>
            </>
          )}
          {section === 'documents' && (
            <div className={s.panel}>
              <DocumentList data={data} matterId={id} />
            </div>
          )}
          {section === 'tasks' && (
            <div className={s.panel}>
              <TaskList data={data} matterId={id} />
            </div>
          )}
          {section === 'messages' && (
            <div className={s.panel}>
              <MatterMessages data={data} matterId={id} />
            </div>
          )}
          {section === 'activity' && (
            <div className={s.panel}>
              <div className={s.panelHeader}>
                <h2> {translate('matters.matterActivity')} </h2>
              </div>
              <ActivityFeed data={data} matterId={id} />
              <p className={s.notice}>
                {' '}
                {translate('matters.activityIsRecordedByTheSelectedApi')}{' '}
              </p>
            </div>
          )}
        </section>
        <aside className={s.stack}>
          <section className={s.panel}>
            <div className={s.panelHeader}>
              <h2> {translate('matters.matterDetails')} </h2>
            </div>
            <div className={s.body}>
              <dl className={s.definition}>
                <div>
                  <dt> {translate('matters.leadCounsel')} </dt>
                  <dd>
                    {lead ? (
                      <span className={s.person}>
                        <Avatar name={lead.name} />
                        {lead.name}
                      </span>
                    ) : (
                      translate('matters.unassigned')
                    )}
                  </dd>
                </div>
                <div>
                  <dt> {translate('matters.team')} </dt>
                  <dd>
                    {matter.teamIds.length
                      ? matter.teamIds.map((userId) => (
                          <div key={userId}>{data.users.find((u) => u.id === userId)?.name}</div>
                        ))
                      : translate('matters.noTeamAssignedYet')}
                  </dd>
                </div>
                <div>
                  <dt> {translate('matters.targetDate')} </dt>
                  <dd>{format.date(matter.targetDate)}</dd>
                </div>
                <div>
                  <dt> {translate('matters.created')} </dt>
                  <dd>{format.date(matter.createdAt, 'short')}</dd>
                </div>
                <div>
                  <dt> {translate('matters.lastUpdated')} </dt>
                  <dd>{format.dateTime(matter.updatedAt)}</dd>
                </div>
              </dl>
              {can.changeMatterStatus && (
                <div className={s.field} style={{ marginTop: 24 }}>
                  <label htmlFor="matter-status"> {translate('matters.matterStatus')} </label>
                  <select
                    id="matter-status"
                    value={matter.status}
                    disabled={mutation.isPending}
                    onChange={(e) => mutation.mutate(e.target.value as MatterStatus)}
                  >
                    {matterStatuses.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                  {mutation.isPending && (
                    <small role="status"> {translate('matters.updatingStatus')} </small>
                  )}
                  {mutation.isSuccess && (
                    <small role="status"> {translate('matters.statusUpdated')} </small>
                  )}
                  {mutation.error && (
                    <span role="alert" className={s.error}>
                      {errorMessage(mutation.error)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </section>
          <div className={s.notice}>
            {' '}
            {translate('matters.jurisdictionIsMatterMetadataLexoraDoesNot')}{' '}
          </div>
        </aside>
      </div>
    </>
  );
}
