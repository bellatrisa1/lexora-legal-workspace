'use client';
import { useT } from '@/i18n/provider';
import Link from 'next/link';
import { Empty } from '@/components/common';
import s from '@/components/ui.module.scss';
export default function NotFound() {
  const translate = useT();

  return (
    <Empty
      title={translate('common.pageNotFound')}
      text={translate('common.thisPageMayHaveMovedReturnTo')}
    >
      <Link href="/overview" className={s.button}>
        {' '}
        {translate('common.backToOverview')}{' '}
      </Link>
    </Empty>
  );
}
