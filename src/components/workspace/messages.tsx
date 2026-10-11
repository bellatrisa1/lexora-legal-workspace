'use client';
import { useT } from '@/i18n/provider';

import Link from 'next/link';
import { MessageSquare, ArrowUpRight } from 'lucide-react';
import { useWorkspace, useFormat } from '@/lib/queries';
import { usePresentation } from '@/lib/presentation';
import { Loading, ErrorState, PageHeading, Badge, Empty } from '../common';
import s from '../ui.module.scss';
export function MessagesPage() {
  const { errorMessage } = usePresentation();

  const translate = useT();

  const query = useWorkspace();
  const format = useFormat();
  if (query.isPending) return <Loading />;
  if (query.error)
    return <ErrorState message={errorMessage(query.error)} retry={() => query.refetch()} />;
  const data = query.data;
  const matters = data.matters.toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return (
    <>
      <PageHeading
        title={translate('navigation.messages')}
        description={translate('messages.clientConversationsAndTeamUpdatesKeptIn')}
      />
      <section className={s.panel}>
        <div className={s.panelHeader}>
          <h2> {translate('messages.matterConversations')} </h2>
          <span className={s.small}>
            {' '}
            {translate('messages.sharedWithTheMattersClientAndLegal')}{' '}
          </span>
        </div>
        {matters.length ? (
          <ul className={s.list}>
            {matters.map((matter) => {
              const messages = data.messages
                .filter((m) => m.matterId === matter.id)
                .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt));
              const latest = messages[0];
              return (
                <li key={matter.id}>
                  <div className={s.row}>
                    <div className={s.person}>
                      <MessageSquare size={17} />
                      <Link className={s.listTitle} href={`/matters/${matter.id}?tab=messages`}>
                        {matter.title}
                      </Link>
                    </div>
                    <Badge status={matter.status} />
                  </div>
                  <p className={s.muted} style={{ fontSize: 12, margin: '12px 0' }}>
                    {latest
                      ? `${data.users.find((u) => u.id === latest.authorId)?.name}: ${latest.text}`
                      : translate('messages.noMessagesYetStartAConversationOn')}
                  </p>
                  <div className={s.row}>
                    <span className={s.small}>
                      {translate('messages.count', { count: messages.length })}
                      {latest ? ` · ${format.dateTime(latest.createdAt)}` : ''}
                    </span>
                    <Link href={`/matters/${matter.id}?tab=messages`} className={s.link}>
                      {' '}
                      {translate('messages.openConversation')} <ArrowUpRight size={13} />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <Empty
            title={translate('messages.noConversationsYet')}
            text={translate('messages.createAMatterToStartCommunicatingWith')}
          />
        )}
      </section>
    </>
  );
}
