'use client';

import { useAdminStats } from '@/lib/hooks';
import { PageSpinner } from '@/components/ui/Feedback';
import DashboardStats from '@/components/admin/DashboardStats';

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useAdminStats();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ink">Dashboard</h1>
      {isLoading || !stats ? <PageSpinner label="Loading dashboard…" /> : <DashboardStats stats={stats} />}
    </div>
  );
}
