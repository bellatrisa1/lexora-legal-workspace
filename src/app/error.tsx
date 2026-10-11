'use client';
import { useT } from '@/i18n/provider';

import { ErrorState } from '@/components/common';
export default function Error({ reset }: { reset: () => void }) {
  const translate = useT();

  return (
    <ErrorState
      message={translate('common.somethingInterruptedThisPageYourDemoChanges')}
      retry={reset}
    />
  );
}
