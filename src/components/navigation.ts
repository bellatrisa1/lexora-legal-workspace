import type { MessageKey } from '@/i18n/messages';
import {
  LayoutDashboard,
  BriefcaseBusiness,
  Users,
  Files,
  ListTodo,
  MessageSquare,
  CalendarDays,
  ChartNoAxesCombined,
  LifeBuoy,
  Settings2,
  UserRound,
} from 'lucide-react';
export const mainNavigation = [
  { href: '/overview', label: 'navigation.overview' as MessageKey, icon: LayoutDashboard },
  { href: '/matters', label: 'matters.matters' as MessageKey, icon: BriefcaseBusiness },
  { href: '/clients', label: 'navigation.clients' as MessageKey, icon: Users },
  { href: '/documents', label: 'navigation.documents' as MessageKey, icon: Files },
  { href: '/tasks', label: 'navigation.tasks' as MessageKey, icon: ListTodo },
  { href: '/messages', label: 'navigation.messages' as MessageKey, icon: MessageSquare },
  { href: '/calendar', label: 'navigation.calendar' as MessageKey, icon: CalendarDays },
  { href: '/analytics', label: 'navigation.analytics' as MessageKey, icon: ChartNoAxesCombined },
];
export const secondaryNavigation = [
  { href: '/team', label: 'navigation.legalTeam' as MessageKey, icon: UserRound },
  { href: '/help', label: 'navigation.helpResources' as MessageKey, icon: LifeBuoy },
  { href: '/settings', label: 'navigation.settings' as MessageKey, icon: Settings2 },
];
