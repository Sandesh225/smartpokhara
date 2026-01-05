import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { createClient } from "@/lib/supabase/server";
import CategoryManager from '../_components/CategoryManager';

export default async function CategoriesPage() {
  const supabase = await createClient();

  // Parallel Fetching
  const [categories, departments] = await Promise.all([
    supabase.from('complaint_categories').select('*').order('display_order'),
    supabase.from('departments').select('id, name').order('name')
  ]);

  return (
    <div className="min-h-screen bg-background section-spacing container-padding">
      <div className="max-w-5xl mx-auto">
        <Link href="/admin/settings" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Settings
        </Link>
        
        <CategoryManager 
          categories={categories.data || []} 
          departments={departments.data || []} 
        />
      </div>
    </div>
  );
}