import { MatterDetail } from '@/components/matters/matter-detail';
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ id }, { tab }] = await Promise.all([params, searchParams]);
  return <MatterDetail key={`${id}-${tab}`} id={id} initialTab={tab} />;
}
