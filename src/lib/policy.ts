import type { Matter, User } from './domain';
export function capabilities(user: User) {
  const legalTeam = user.role !== 'client';
  return {
    createMatter: true,
    changeMatterStatus: legalTeam,
    manageTasks: legalTeam,
    assignCounsel: legalTeam,
    viewTeam: legalTeam,
  };
}
export function canViewMatter(user: User, matter: Matter) {
  return (
    user.organizationId === matter.organizationId &&
    (user.role !== 'client' || user.clientId === matter.clientId)
  );
}
