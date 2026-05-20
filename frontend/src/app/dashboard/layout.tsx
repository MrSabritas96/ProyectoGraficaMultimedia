import { DashboardLayout } from '@/modules/dashboard/ui/DashboardLayout';
import { cookies } from 'next/headers';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const role = cookieStore.get('role')?.value || 'Guest';

  return <DashboardLayout role={role}>{children}</DashboardLayout>;
}
