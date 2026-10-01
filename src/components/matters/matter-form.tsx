'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import { matterSchema, priorities, validationCode } from '@/lib/domain';
import { api } from '@/lib/api';
import { useWorkspace } from '@/lib/queries';
import { capabilities } from '@/lib/policy';
import { errorMessage, priorityLabels } from '@/lib/presentation';
import copy from '@/i18n/messages/en.json';
import { useWorkspaceContext } from '../providers';
import { ErrorState, Loading, PageHeading } from '../common';
import s from '../ui.module.scss';
export function MatterForm() {
  const { session } = useWorkspaceContext();
  const query = useWorkspace();
  const cache = useQueryClient();
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const mutation = useMutation({
    mutationFn: (input: Parameters<typeof api.createMatter>[1]) => api.createMatter(session, input),
    onSuccess: async (matter) => {
      await cache.invalidateQueries({ queryKey: ['workspace'] });
      router.push(`/matters/${matter.id}`);
    },
  });
  if (query.isPending) return <Loading />;
  if (query.error)
    return <ErrorState message={errorMessage(query.error)} retry={() => query.refetch()} />;
  const data = query.data;
  const can = capabilities(data.currentUser);
  return (
    <>
      <Link href="/matters" className={s.back}>
        <ArrowLeft size={13} />
        Back to matters
      </Link>
      <PageHeading
        title="Create a matter"
        description="Set the context. Bring the right people and information together."
      />
      <div className={s.twoColumns}>
        <section className={s.panel}>
          <form
            className={s.form}
            ref={form}
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (mutation.isPending) return;
              const result = matterSchema.safeParse(
                Object.fromEntries(new FormData(e.currentTarget)),
              );
              if (!result.success) {
                const next: Record<string, string> = {};
                for (const issue of result.error.issues)
                  next[String(issue.path[0])] ??= copy.validation[validationCode(issue.message)];
                setErrors(next);
                const first = form.current?.elements.namedItem(Object.keys(next)[0]);
                if (first instanceof HTMLElement) first.focus();
                return;
              }
              setErrors({});
              mutation.mutate(result.data);
            }}
          >
            <div className={s.formSection}>
              <h2>Matter essentials</h2>
              <p>Fields marked with * are required.</p>
            </div>
            <Field name="title" label="Matter name" error={errors.title}>
              <input
                id="title"
                name="title"
                maxLength={120}
                placeholder="e.g. Cross-border technology acquisition"
                aria-invalid={!!errors.title}
                aria-describedby="title-error"
              />
            </Field>
            <div className={s.formRow}>
              <Field name="clientId" label="Client" error={errors.clientId}>
                <select
                  id="clientId"
                  name="clientId"
                  aria-invalid={!!errors.clientId}
                  aria-describedby="clientId-error"
                >
                  {data.clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field name="practiceAreaId" label="Practice area" error={errors.practiceAreaId}>
                <select id="practiceAreaId" name="practiceAreaId">
                  {data.practiceAreas.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className={s.formRow}>
              <Field name="jurisdictionId" label="Jurisdiction" error={errors.jurisdictionId}>
                <select id="jurisdictionId" name="jurisdictionId">
                  {data.jurisdictions.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field name="targetDate" label="Target date" error={errors.targetDate}>
                <input
                  id="targetDate"
                  name="targetDate"
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  aria-invalid={!!errors.targetDate}
                  aria-describedby="targetDate-error"
                />
              </Field>
            </div>
            <div className={s.formRow}>
              {can.assignCounsel ? (
                <Field
                  name="leadCounselId"
                  label="Lead counsel"
                  optional
                  error={errors.leadCounselId}
                >
                  <select id="leadCounselId" name="leadCounselId">
                    <option value="">Assign later</option>
                    {data.users
                      .filter((u) => u.role === 'lawyer')
                      .map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                  </select>
                </Field>
              ) : (
                <input type="hidden" name="leadCounselId" value="" />
              )}
              <Field name="priority" label="Priority" error={errors.priority}>
                <select id="priority" name="priority" defaultValue="medium">
                  {priorities.map((p) => (
                    <option key={p} value={p}>
                      {priorityLabels[p]}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field name="description" label="Description" error={errors.description}>
              <textarea
                id="description"
                name="description"
                maxLength={4000}
                placeholder="Describe the scope, desired outcome, key dates and people involved…"
                aria-invalid={!!errors.description}
                aria-describedby="description-error"
              />
              <small>20–4,000 characters. Use fictional information in this demo.</small>
            </Field>
            <div className={s.notice}>
              <FileText size={14} /> Documents can be reviewed within a matter. Real file uploads
              are not connected in this demo.
            </div>
            {mutation.error && (
              <p role="alert" className={s.error}>
                {errorMessage(mutation.error)}
              </p>
            )}
            <div className={s.actions}>
              <button className={s.button} disabled={mutation.isPending}>
                {mutation.isPending ? 'Creating matter…' : 'Create matter'}
                <ArrowRight size={14} />
              </button>
              <Link href="/matters" className={s.secondary}>
                Cancel
              </Link>
            </div>
          </form>
        </section>
        <aside className={s.panel}>
          <div className={s.body}>
            <p className={s.eyebrow}>A connected workspace</p>
            <h2>Start with a clear scope</h2>
            <p className={s.subheading}>
              A matter brings together a client, a legal team and a defined piece of work.
            </p>
            <dl className={s.definition}>
              <div>
                <dt>Organization</dt>
                <dd>{data.organization.name}</dd>
              </div>
              <div>
                <dt>Jurisdiction</dt>
                <dd>A reference for your team, not an automated legal assessment.</dd>
              </div>
              <div>
                <dt>What happens next?</dt>
                <dd>
                  The matter opens with an activity record. Your team can review its status and
                  start the conversation.
                </dd>
              </div>
            </dl>
            <hr className={s.divider} />
            <p className={s.small}>Demo changes are stored in this tab and reset on reload.</p>
          </div>
        </aside>
      </div>
    </>
  );
}
function Field({
  name,
  label,
  error,
  optional = false,
  children,
}: {
  name: string;
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={s.field}>
      <label htmlFor={name}>
        {label}
        {!optional && ' *'}
      </label>
      {children}
      <span id={`${name}-error`} className={s.error}>
        {error}
      </span>
    </div>
  );
}
