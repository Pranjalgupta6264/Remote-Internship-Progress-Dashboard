'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { UserRole } from '@/types';

export default function InternLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={[UserRole.INTERN]}>
      <DashboardLayout>{children}</DashboardLayout>
    </RoleGuard>
  );
}
