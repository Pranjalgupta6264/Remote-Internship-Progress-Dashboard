import { CheckSquare, FileText, LayoutDashboard, MessageSquare, Settings, TrendingUp, Users, KanbanSquare } from 'lucide-react';
import { UserRole } from '@/types';
import type { ComponentType } from 'react';

export interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

export const roleNavigation: Record<UserRole, NavItem[]> = {
  [UserRole.ADMIN]: [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ],
  [UserRole.MENTOR]: [
    { label: 'Dashboard', href: '/mentor', icon: LayoutDashboard },
    { label: 'Tasks', href: '/mentor/tasks', icon: CheckSquare },
    { label: 'Kanban', href: '/mentor/kanban', icon: KanbanSquare },
    { label: 'Reports', href: '/mentor/reports', icon: FileText },
    { label: 'Feedback', href: '/mentor/feedback', icon: MessageSquare },
    { label: 'Analytics', href: '/mentor/analytics', icon: TrendingUp },
  ],
  [UserRole.INTERN]: [
    { label: 'Dashboard', href: '/intern', icon: LayoutDashboard },
    { label: 'Tasks', href: '/intern/tasks', icon: CheckSquare },
    { label: 'Reports', href: '/intern/reports', icon: FileText },
    { label: 'Feedback', href: '/intern/feedback', icon: MessageSquare },
    { label: 'Analytics', href: '/intern/analytics', icon: TrendingUp },
  ],
};
