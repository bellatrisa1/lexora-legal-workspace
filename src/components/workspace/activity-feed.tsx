'use client';
import { useT } from '@/i18n/provider';

import Link from 'next/link';
import { Activity as ActivityIcon } from 'lucide-react';
import type { WorkspaceData } from '@/lib/domain';
import { usePresentation } from '@/lib/presentation';
import { useFormat } from '@/lib/queries';
import { Empty } from '../common';
import s from '../ui.module.scss';
export function ActivityFeed({
  data,
  matterId,
  limit = 20,
}: {
  data: WorkspaceData;
  matterId?: string;
  limit?: number;
}) {
  const { activityText } = usePresentation();

  const translate = useT();

  const format = useFormat();
  const events = data.activities
    .filter((a) => !matterId || a.matterId === matterId)
    .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
  if (!events.length)
    return (
      <Empty
        title={translate('activityfeed.noActivityYet')}
        text={translate('activityfeed.matterUpdatesWillAppearHereAsWork')}
      />
    );
  return (
    <ul className={s.list}>
      {events.map((event) => (
        <li key={event.id}>
          <div className={s.activity}>
            <span className={s.activityDot}>
              <ActivityIcon size={12} />
            </span>
            <div>
              <p>
                <strong>
                  {data.users.find((u) => u.id === event.actorId)?.name ??
                    translate('activityfeed.teamMember')}
                </strong>{' '}
                {activityText(event, data)}
              </p>
              {!matterId && (
                <Link href={`/matters/${event.matterId}`} className={s.listTitle}>
                  {data.matters.find((m) => m.id === event.matterId)?.title}
                </Link>
              )}
              <time dateTime={event.createdAt}>{format.dateTime(event.createdAt)}</time>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
