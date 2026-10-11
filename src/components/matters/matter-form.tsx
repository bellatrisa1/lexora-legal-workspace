'use client';
import { useT } from '@/i18n/provider';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { isRestMode } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import { matterSchema, priorities, validationCode } from '@/lib/domain';
import { api } from '@/lib/api';
import { useWorkspace } from '@/lib/queries';
import { capabilities } from '@/lib/policy';
import { usePresentation } from '@/lib/presentation';

import { useWorkspaceContext } from '../providers';
import { ErrorState, Loading, PageHeading } from '../common';
import s from '../ui.module.scss';
export function MatterForm() {
  const { errorMessage, priorityLabels } = usePresentation();

  const translate = useT();

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
        <ArrowLeft size={13} /> {translate('matters.backToMatters')}{' '}
      </Link>
      <PageHeading
        title={translate('matters.createAMatter')}
        description={translate('matters.setTheContextBringTheRightPeople')}
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
                  next[String(issue.path[0])] ??= validationCode(issue.message);
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
              <h2> {translate('matters.matterEssentials')} </h2>
              <p> {translate('matters.fieldsMarkedWithAreRequired')} </p>
            </div>
            <Field
              name="title"
              label={translate('matters.matterName')}
              error={
                errors.title ? translate(`validation.${validationCode(errors.title)}`) : undefined
              }
            >
              <input
                id="title"
                name="title"
                maxLength={120}
                placeholder={translate('matters.egCrossborderTechnologyAcquisition')}
                aria-invalid={!!errors.title}
                aria-describedby="title-error"
              />
            </Field>
            <div className={s.formRow}>
              <Field
                name="clientId"
                label={translate('matters.client')}
                error={
                  errors.clientId
                    ? translate(`validation.${validationCode(errors.clientId)}`)
                    : undefined
                }
              >
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
              <Field
                name="practiceAreaId"
                label={translate('matters.practiceArea')}
                error={
                  errors.practiceAreaId
                    ? translate(`validation.${validationCode(errors.practiceAreaId)}`)
                    : undefined
                }
              >
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
              <Field
                name="jurisdictionId"
                label={translate('matters.jurisdiction')}
                error={
                  errors.jurisdictionId
                    ? translate(`validation.${validationCode(errors.jurisdictionId)}`)
                    : undefined
                }
              >
                <select id="jurisdictionId" name="jurisdictionId">
                  {data.jurisdictions.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                name="targetDate"
                label={translate('matters.targetDate')}
                error={
                  errors.targetDate
                    ? translate(`validation.${validationCode(errors.targetDate)}`)
                    : undefined
                }
              >
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
                  label={translate('matters.leadCounsel')}
                  optional
                  error={
                    errors.leadCounselId
                      ? translate(`validation.${validationCode(errors.leadCounselId)}`)
                      : undefined
                  }
                >
                  <select id="leadCounselId" name="leadCounselId">
                    <option value=""> {translate('matters.assignLater')} </option>
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
              <Field
                name="priority"
                label={translate('matters.priority')}
                error={
                  errors.priority
                    ? translate(`validation.${validationCode(errors.priority)}`)
                    : undefined
                }
              >
                <select id="priority" name="priority" defaultValue="medium">
                  {priorities.map((p) => (
                    <option key={p} value={p}>
                      {priorityLabels[p]}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field
              name="description"
              label={translate('matters.description')}
              error={
                errors.description
                  ? translate(`validation.${validationCode(errors.description)}`)
                  : undefined
              }
            >
              <textarea
                id="description"
                name="description"
                maxLength={4000}
                placeholder={translate('matters.describeTheScopeDesiredOutcomeKeyDates')}
                aria-invalid={!!errors.description}
                aria-describedby="description-error"
              />
              <small> {translate('matters.204000CharactersUseFictionalInformationInThis')} </small>
            </Field>
            <div className={s.notice}>
              <FileText size={14} /> {translate('matters.documentsCanBeReviewedWithinAMatter')}{' '}
            </div>
            {mutation.error && (
              <p role="alert" className={s.error}>
                {errorMessage(mutation.error)}
              </p>
            )}
            <div className={s.actions}>
              <button className={s.button} disabled={mutation.isPending}>
                {mutation.isPending
                  ? translate('matters.creatingMatter')
                  : translate('matters.createMatter')}
                <ArrowRight size={14} />
              </button>
              <Link href="/matters" className={s.secondary}>
                {' '}
                {translate('matters.cancel')}{' '}
              </Link>
            </div>
          </form>
        </section>
        <aside className={s.panel}>
          <div className={s.body}>
            <p className={s.eyebrow}> {translate('matters.aConnectedWorkspace')} </p>
            <h2> {translate('matters.startWithAClearScope')} </h2>
            <p className={s.subheading}> {translate('matters.aMatterBringsTogetherAClientA')} </p>
            <dl className={s.definition}>
              <div>
                <dt> {translate('matters.organization')} </dt>
                <dd>{data.organization.name}</dd>
              </div>
              <div>
                <dt> {translate('matters.jurisdiction')} </dt>
                <dd> {translate('matters.aReferenceForYourTeamNotAn')} </dd>
              </div>
              <div>
                <dt> {translate('matters.whatHappensNext')} </dt>
                <dd> {translate('matters.theMatterOpensWithAnActivityRecord')} </dd>
              </div>
            </dl>
            <hr className={s.divider} />
            <p className={s.small}>
              {isRestMode
                ? translate('matters.changesAreSavedInPostgresqlDemoIdentity')
                : translate('matters.demoChangesAreStoredInThisTab')}
            </p>
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
