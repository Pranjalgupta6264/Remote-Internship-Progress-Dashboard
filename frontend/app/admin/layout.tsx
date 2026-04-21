'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { UserRole } from '@/types';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <DashboardLayout>{children}</DashboardLayout>
    </RoleGuard>
  );
}
