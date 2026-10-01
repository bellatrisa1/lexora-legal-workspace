'use client';
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
  const format = useFormat();
  if (!matters.length)
    return <Empty title="No matters found" text="Try a different search or reset your filters." />;
  return (
    <div className={s.tableWrap}>
      <table className={s.table}>
        <thead>
          <tr>
            <th>Matter / Client</th>
            <th>Status</th>
            {!compact && <th>Jurisdiction</th>}
            <th>Lead counsel</th>
            <th>Target date</th>
            <th>{compact ? <span className={s.srOnly}>Open matter</span> : 'Priority'}</th>
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
                <td data-label="Status">
                  <Badge status={matter.status} />
                </td>
                {!compact && (
                  <td data-label="Jurisdiction">
                    {data.jurisdictions.find((j) => j.id === matter.jurisdictionId)?.name}
                  </td>
                )}
                <td data-label="Lead counsel">
                  {lead ? (
                    <span className={s.person}>
                      <Avatar name={lead.name} initials={lead.initials} />
                      {lead.name.split(' ')[0]} {lead.name.split(' ')[1]?.[0]}.
                    </span>
                  ) : (
                    'Unassigned'
                  )}
                </td>
                <td data-label="Target date">{format.date(matter.targetDate, 'short')}</td>
                <td>
                  {compact ? (
                    <Link href={`/matters/${matter.id}`} aria-label={`Open ${matter.reference}`}>
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
