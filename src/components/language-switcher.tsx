'use client';
import { Dialog } from './dialog';
import s from './shell.module.scss';
import ui from './ui.module.scss';
export function LanguageSwitcher() {
  return (
    <Dialog
      title="Language preferences"
      trigger={
        <>
          EN <span aria-hidden="true">⌄</span>
        </>
      }
      className={s.language}
    >
      <div className={ui.body}>
        <h3>English workspace</h3>
        <p className={ui.muted}>
          Lexora’s redesigned workspace is currently available in English. Russian, Spanish, French
          and Italian are planned for the next stage.
        </p>
        <p className={ui.small}>
          Language, jurisdiction, currency and timezone are independent preferences.
        </p>
      </div>
    </Dialog>
  );
}
