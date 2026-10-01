import { MatterList } from '@/components/matters/matter-list';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  return (
    <MatterList
      key={`${params.q}-${params.status}`}
      initialSearch={params.q}
      initialStatus={params.status}
    />
  );
}
