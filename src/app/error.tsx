'use client';
import { ErrorState } from '@/components/common';
export default function Error({ reset }: { reset: () => void }) {
  return (
    <ErrorState
      message="Something interrupted this page. Your demo changes may still be available in this tab."
      retry={reset}
    />
  );
}
