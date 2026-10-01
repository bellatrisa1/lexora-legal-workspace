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
  { href: '/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/matters', label: 'Matters', icon: BriefcaseBusiness },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/documents', label: 'Documents', icon: Files },
  { href: '/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/analytics', label: 'Analytics', icon: ChartNoAxesCombined },
];
export const secondaryNavigation = [
  { href: '/team', label: 'Legal Team', icon: UserRound },
  { href: '/help', label: 'Help & resources', icon: LifeBuoy },
  { href: '/settings', label: 'Settings', icon: Settings2 },
];
