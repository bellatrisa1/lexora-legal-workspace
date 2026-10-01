import Link from 'next/link';
import { Empty } from '@/components/common';
import s from '@/components/ui.module.scss';
export default function NotFound() {
  return (
    <Empty
      title="Page not found"
      text="This page may have moved. Return to your workspace to continue."
    >
      <Link href="/overview" className={s.button}>
        Back to overview
      </Link>
    </Empty>
  );
}
