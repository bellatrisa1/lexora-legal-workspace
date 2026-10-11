'use client';
import { useT } from '@/i18n/provider';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import type { WorkspaceData } from '@/lib/domain';
import { messageSchema, validationCode } from '@/lib/domain';
import { api } from '@/lib/api';
import { useFormat } from '@/lib/queries';
import { usePresentation } from '@/lib/presentation';

import { useWorkspaceContext } from '../providers';
import { Avatar, Empty } from '../common';
import s from '../ui.module.scss';
export function MatterMessages({ data, matterId }: { data: WorkspaceData; matterId: string }) {
  const { errorMessage } = usePresentation();

  const translate = useT();

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
      <div className={s.notice}> {translate('matters.aSharedConversationWithTheClientAnd')} </div>
      {messages.length ? (
        messages.map((message) => {
          const author = data.users.find((u) => u.id === message.authorId);
          return (
            <article className={s.message} key={message.id}>
              <header>
                <Avatar name={author?.name ?? translate('matters.member')} />
                <strong>{author?.name}</strong>
                <span className={s.small}>
                  {author?.role === 'client'
                    ? translate('matters.client')
                    : translate('matters.legalTeam')}
                </span>
                <time dateTime={message.createdAt}>{format.dateTime(message.createdAt)}</time>
              </header>
              <p>{message.text}</p>
            </article>
          );
        })
      ) : (
        <Empty
          title={translate('matters.startTheConversation')}
          text={translate('matters.shareAnUpdateAskAQuestionOr')}
        />
      )}
      <form
        className={s.messageForm}
        onSubmit={(e) => {
          e.preventDefault();
          if (mutation.isPending) return;
          const parsed = messageSchema.safeParse(text);
          if (!parsed.success) {
            setValidation(validationCode(parsed.error.issues[0].message));
            return;
          }
          setValidation('');
          setSent(false);
          mutation.mutate(parsed.data);
        }}
      >
        <div className={s.field}>
          <label htmlFor="message"> {translate('matters.yourMessage')} </label>
          <textarea
            id="message"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setSent(false);
            }}
            maxLength={2000}
            placeholder={translate('matters.writeAnUpdateForEveryoneOnThis')}
            aria-invalid={!!validation}
            aria-describedby="message-error"
          />
        </div>
        <span id="message-error" role="alert" className={s.error}>
          {validation
            ? translate(`validation.${validationCode(validation)}`)
            : mutation.error
              ? errorMessage(mutation.error)
              : ''}
        </span>
        <button className={s.button} disabled={mutation.isPending}>
          <Send size={14} />
          {mutation.isPending ? translate('matters.sending') : translate('matters.sendMessage')}
        </button>
        {sent && (
          <span role="status" className={s.success}>
            {' '}
            {translate('matters.messageAddedToTheDemoConversation')}{' '}
          </span>
        )}
      </form>
    </div>
  );
}
