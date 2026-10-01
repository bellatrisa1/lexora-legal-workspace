'use client';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import type { WorkspaceData } from '@/lib/domain';
import { messageSchema, validationCode } from '@/lib/domain';
import { api } from '@/lib/api';
import { useFormat } from '@/lib/queries';
import { errorMessage } from '@/lib/presentation';
import copy from '@/i18n/messages/en.json';
import { useWorkspaceContext } from '../providers';
import { Avatar, Empty } from '../common';
import s from '../ui.module.scss';
export function MatterMessages({ data, matterId }: { data: WorkspaceData; matterId: string }) {
  const { session } = useWorkspaceContext();
  const cache = useQueryClient();
  const format = useFormat();
  const [text, setText] = useState('');
  const [validation, setValidation] = useState('');
  const [sent, setSent] = useState(false);
  const mutation = useMutation({
    mutationFn: (value: string) => api.sendMessage(session, matterId, value),
    onSuccess: async () => {
      setText('');
      setSent(true);
      await cache.invalidateQueries({ queryKey: ['workspace'] });
    },
  });
  const messages = data.messages
    .filter((m) => m.matterId === matterId)
    .toSorted((a, b) => a.createdAt.localeCompare(b.createdAt));
  return (
    <div className={s.body}>
      <div className={s.notice}>
        A shared conversation with the client and legal team. Demo messages stay in this tab; no
        automatic lawyer replies are generated.
      </div>
      {messages.length ? (
        messages.map((message) => {
          const author = data.users.find((u) => u.id === message.authorId);
          return (
            <article className={s.message} key={message.id}>
              <header>
                <Avatar name={author?.name ?? 'Member'} />
                <strong>{author?.name}</strong>
                <span className={s.small}>
                  {author?.role === 'client' ? 'Client' : 'Legal team'}
                </span>
                <time dateTime={message.createdAt}>{format.dateTime(message.createdAt)}</time>
              </header>
              <p>{message.text}</p>
            </article>
          );
        })
      ) : (
        <Empty
          title="Start the conversation"
          text="Share an update, ask a question or clarify the next step."
        />
      )}
      <form
        className={s.messageForm}
        onSubmit={(e) => {
          e.preventDefault();
          if (mutation.isPending) return;
          const parsed = messageSchema.safeParse(text);
          if (!parsed.success) {
            setValidation(copy.validation[validationCode(parsed.error.issues[0].message)]);
            return;
          }
          setValidation('');
          setSent(false);
          mutation.mutate(parsed.data);
        }}
      >
        <div className={s.field}>
          <label htmlFor="message">Your message</label>
          <textarea
            id="message"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setSent(false);
            }}
            maxLength={2000}
            placeholder="Write an update for everyone on this matter…"
            aria-invalid={!!validation}
            aria-describedby="message-error"
          />
        </div>
        <span id="message-error" role="alert" className={s.error}>
          {validation || (mutation.error ? errorMessage(mutation.error) : '')}
        </span>
        <button className={s.button} disabled={mutation.isPending}>
          <Send size={14} />
          {mutation.isPending ? 'Sending…' : 'Send message'}
        </button>
        {sent && (
          <span role="status" className={s.success}>
            Message added to the demo conversation.
          </span>
        )}
      </form>
    </div>
  );
}
