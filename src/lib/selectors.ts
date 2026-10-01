import type { Matter, WorkspaceData } from './domain';
export const isActive = (matter: Matter) => matter.status !== 'closed';
export function upcoming(data: WorkspaceData, today: string, days = 14) {
  const end = new Date(today + 'T00:00:00Z');
  end.setUTCDate(end.getUTCDate() + days);
  const until = end.toISOString().slice(0, 10);
  return data.matters
    .filter((m) => isActive(m) && m.targetDate >= today && m.targetDate <= until)
    .toSorted((a, b) => a.targetDate.localeCompare(b.targetDate));
}
export function matterName(data: WorkspaceData, id: string) {
  return data.matters.find((m) => m.id === id)?.title ?? 'Matter unavailable';
}
