// app/(protected)/citizen/complaints/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUserWithRoles } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { ComplaintTable } from '@/components/complaints/ComplaintTable';
import { ComplaintListFilters } from '@/components/complaints/ComplaintListFilters';
import { ComplaintStats } from '@/components/complaints/ComplaintStats';
import type { Database } from '@/lib/types/database.types';

type Db = Database;
type ComplaintRow = Db['public']['Tables']['complaints']['Row'];

interface CitizenComplaintsPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function CitizenComplaintsPage({
  searchParams,
}: CitizenComplaintsPageProps) {
  const user = await getCurrentUserWithRoles();
  if (!user) {
    redirect('/login');
  }

  const supabase = await createClient();

  const getParam = (key: string): string | undefined =>
    typeof searchParams[key] === 'string'
      ? (searchParams[key] as string)
      : undefined;

  const getArrayParam = (key: string): string[] => {
    const value = searchParams[key];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return [value];
    return [];
  };

  let query = supabase
    .from('complaints')
    .select(
      `
      id,
      tracking_code,
      title,
      status,
      priority,
      submitted_at,
      sla_due_at,
      category:complaint_categories(name),
      subcategory:complaint_subcategories(name),
      ward:wards(ward_number, name)
    `,
      { count: 'exact' },
    )
    .eq('citizen_id', user.id)
    .order('submitted_at', { ascending: false });

  const statusFilter = getArrayParam('status');
  if (statusFilter.length > 0) {
    query = query.in('status', statusFilter);
  }

  const priorityFilter = getArrayParam('priority');
  if (priorityFilter.length > 0) {
    query = query.in('priority', priorityFilter);
  }

  const categoryFilter = getArrayParam('category');
  if (categoryFilter.length > 0) {
    query = query.in('category_id', categoryFilter);
  }

  const wardFilter = getArrayParam('ward');
  if (wardFilter.length > 0) {
    query = query.in('ward_id', wardFilter);
  }

  const search = getParam('search');
  if (search && search.trim()) {
    const s = search.trim();
    query = query.or(
      `title.ilike.%${s}%,tracking_code.ilike.%${s.toUpperCase()}%`,
    );
  }

  const dateFrom = getParam('dateFrom');
  if (dateFrom) {
    query = query.gte('submitted_at', dateFrom);
  }

  const dateTo = getParam('dateTo');
  if (dateTo) {
    query = query.lte('submitted_at', `${dateTo}T23:59:59.999Z`);
  }

  const { data: complaints, error, count } = await query;

  if (error) {
    console.error('Error fetching complaints:', error);
  }

  const { data: categories } = await supabase
    .from('complaint_categories')
    .select('id, name')
    .eq('is_active', true)
    .order('name', { ascending: true });

  const { data: wards } = await supabase
    .from('wards')
    .select('id, ward_number, name')
    .eq('is_active', true)
    .order('ward_number', { ascending: true });

  const statsMap = new Map<ComplaintRow['status'], number>();
  (complaints as ComplaintRow[] | null)?.forEach((c) => {
    statsMap.set(c.status, (statsMap.get(c.status) ?? 0) + 1);
  });

  const stats = Array.from(statsMap.entries()).map(([status, value]) => ({
    status,
    count: value,
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900">My Complaints</h1>
        <p className="mt-2 text-gray-600">
          Track and manage your submitted complaints.
        </p>
      </div>

      <ComplaintStats stats={stats} />

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <ComplaintListFilters
            availableFilters={{
              status: true,
              priority: true,
              category: true,
              ward: true,
              dateRange: true,
            }}
            categories={categories ?? []}
            wards={wards ?? []}
          />
        </div>

        <ComplaintTable
          complaints={(complaints as any) ?? []}
          totalCount={count ?? complaints?.length ?? 0}
        />
      </div>
    </div>
  );
}
