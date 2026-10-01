'use client';
import { CircleAlert, FolderOpen, ArrowUpRight, Minus } from 'lucide-react';
import type { MatterStatus, Priority } from '@/lib/domain';
import { statusLabels, priorityLabels } from '@/lib/presentation';
import s from './ui.module.scss';
export function Badge({ status, label }: { status: string; label?: string }) {
  return (
    <span className={`${s.badge} ${s[status] ?? ''}`}>
      {label ?? statusLabels[status as MatterStatus] ?? status}
    </span>
  );
}
export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`${s.priority} ${s[priority] ?? ''}`}>
      {priority === 'high' ? <ArrowUpRight size={13} /> : <Minus size={12} />}{' '}
      {priorityLabels[priority]}
    </span>
  );
}
export function Avatar({ name, initials }: { name: string; initials?: string }) {
  return (
    <span className={s.avatar} aria-label={name}>
      {initials ??
        name
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')}
    </span>
  );
}
export function Loading() {
  return (
    <div role="status" aria-label="Loading workspace" className={s.skeleton}>
      <div />
      <div />
      <div />
      <span className={s.srOnly}>Loading workspace…</span>
    </div>
  );
}
export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className={`${s.panel} ${s.empty}`} role="alert">
      <CircleAlert size={28} />
      <h2>Unable to load this workspace</h2>
      <p>{message}</p>
      {retry && (
        <button className={s.secondary} onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}
export function Empty({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={s.empty}>
      <FolderOpen size={28} />
      <h2>{title}</h2>
      <p>{text}</p>
      {children}
    </div>
  );
}
export function PageHeading({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={s.heading}>
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
