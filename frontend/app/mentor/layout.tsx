'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { UserRole } from '@/types';

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={[UserRole.MENTOR, UserRole.ADMIN]}>
      <DashboardLayout>{children}</DashboardLayout>
    </RoleGuard>
  );
}
