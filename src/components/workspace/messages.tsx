'use client';
import Link from 'next/link';
import { MessageSquare, ArrowUpRight } from 'lucide-react';
import { useWorkspace, useFormat } from '@/lib/queries';
import { errorMessage } from '@/lib/presentation';
import { Loading, ErrorState, PageHeading, Badge, Empty } from '../common';
import s from '../ui.module.scss';
export function MessagesPage() {
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
        title="Messages"
        description="Client conversations and team updates, kept in the context of each matter."
      />
      <section className={s.panel}>
        <div className={s.panelHeader}>
          <h2>Matter conversations</h2>
          <span className={s.small}>Shared with the matter’s client and legal team</span>
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
                      : 'No messages yet. Start a conversation on this matter.'}
                  </p>
                  <div className={s.row}>
                    <span className={s.small}>
                      {messages.length} messages
                      {latest ? ` · ${format.dateTime(latest.createdAt)}` : ''}
                    </span>
                    <Link href={`/matters/${matter.id}?tab=messages`} className={s.link}>
                      Open conversation <ArrowUpRight size={13} />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <Empty
            title="No conversations yet"
            text="Create a matter to start communicating with your team."
          />
        )}
      </section>
    </>
  );
}
