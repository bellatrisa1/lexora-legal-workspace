'use client';
import { useId, useRef } from 'react';
import { X } from 'lucide-react';
import s from './ui.module.scss';
export function Dialog({
  title,
  trigger,
  children,
  className,
}: {
  title: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const close = () => ref.current?.close();
  return (
    <>
      <button
        type="button"
        className={className ?? s.iconButton}
        aria-label={title}
        onClick={() => ref.current?.showModal()}
      >
        {trigger}
      </button>
      <dialog
        ref={ref}
        className={s.dialog}
        aria-labelledby={id}
        onClick={(event) => {
          if (
            event.target instanceof Element &&
            event.target.closest('a[href], [data-dialog-close]')
          )
            close();
        }}
      >
        <div className={s.dialogHead}>
          <h2 id={id}>{title}</h2>
          <button className={s.iconButton} onClick={close} aria-label="Close dialog">
            <X size={17} />
          </button>
        </div>
        {children}
      </dialog>
    </>
  );
}
