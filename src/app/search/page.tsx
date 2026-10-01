import { SearchPage } from '@/components/workspace/search';
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return <SearchPage query={q ?? ''} />;
}
