'use client';
import { useT } from '@/i18n/provider';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Matter, WorkspaceData } from '@/lib/domain';
import { useFormat } from '@/lib/queries';
import { Avatar, Badge, PriorityBadge, Empty } from '../common';
import s from '../ui.module.scss';
export function MatterTable({
  matters,
  data,
  compact = false,
}: {
  matters: Matter[];
  data: WorkspaceData;
  compact?: boolean;
}) {
  const translate = useT();

  const format = useFormat();
  if (!matters.length)
    return (
      <Empty
        title={translate('matters.noMattersFound')}
        text={translate('matters.tryADifferentSearchOrResetYour')}
      />
    );
  return (
    <div className={s.tableWrap}>
      <table className={s.table}>
        <thead>
          <tr>
            <th> {translate('matters.matterClient')} </th>
            <th> {translate('matters.status')} </th>
            {!compact && <th> {translate('matters.jurisdiction')} </th>}
            <th> {translate('matters.leadCounsel')} </th>
            <th> {translate('matters.targetDate')} </th>
            <th>
              {compact ? (
                <span className={s.srOnly}> {translate('matters.openMatter')} </span>
              ) : (
                translate('matters.priority')
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {matters.map((matter) => {
            const lead = data.users.find((u) => u.id === matter.leadCounselId);
            return (
              <tr key={matter.id}>
                <td>
                  <Link className={s.title} href={`/matters/${matter.id}`}>
                    {matter.title}
                  </Link>
                  <small>{data.clients.find((c) => c.id === matter.clientId)?.name}</small>
                </td>
                <td data-label={translate('matters.status')}>
                  <Badge status={matter.status} />
                </td>
                {!compact && (
                  <td data-label={translate('matters.jurisdiction')}>
                    {data.jurisdictions.find((j) => j.id === matter.jurisdictionId)?.name}
                  </td>
                )}
                <td data-label={translate('matters.leadCounsel')}>
                  {lead ? (
                    <span className={s.person}>
                      <Avatar name={lead.name} initials={lead.initials} />
                      {lead.name.split(' ')[0]} {lead.name.split(' ')[1]?.[0]}.
                    </span>
                  ) : (
                    translate('matters.unassigned')
                  )}
                </td>
                <td data-label={translate('matters.targetDate')}>
                  {format.date(matter.targetDate, 'short')}
                </td>
                <td>
                  {compact ? (
                    <Link
                      href={`/matters/${matter.id}`}
                      aria-label={translate('matters.openReference', {
                        reference: matter.reference,
                      })}
                    >
                      <ChevronRight size={15} />
                    </Link>
                  ) : (
                    <PriorityBadge priority={matter.priority} />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
