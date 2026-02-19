"use client";

import { usePages, usePageMutations } from "@/features/notices";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function PagesCMSPage() {
  const { data: pagesData, isLoading: loading } = usePages();
  const pages = pagesData || [];
  const { deletePage } = usePageMutations();

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Website Pages</h1>
          <Button asChild>
             <Link href="/admin/content/pages/create"><Plus className="mr-2 h-4 w-4"/> Add Page</Link>
          </Button>
       </div>

       {loading ? <div className="text-center p-10">Loading pages...</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {pages.map((page) => (
                <Card key={page.id} className="hover:shadow-md transition-shadow">
                   <CardContent className="p-5 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-2">
                         <div className="p-2 bg-slate-100 rounded-lg">
                            <FileText className="h-6 w-6 text-slate-500" />
                         </div>
                         <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                            {page.status}
                         </Badge>
                      </div>
                      
                      <h3 className="font-bold text-lg mb-1">{page.title}</h3>
                      <p className="text-xs text-gray-400 font-mono mb-4">/{page.slug}</p>
                      
                      <div className="mt-auto pt-4 border-t flex justify-between items-center">
                         <span className="text-xs text-gray-400">
                            {format(new Date(page.created_at), "MMM d, yyyy")}
                         </span>
                         <div className="flex gap-2">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={`/admin/content/pages/${page.id}/edit`}>
                                    <Edit className="h-4 w-4 text-gray-500"/>
                                </Link>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => deletePage.mutate(page.id)}>
                                <Trash2 className="h-4 w-4 text-red-500"/>
                            </Button>
                         </div>
                      </div>
                   </CardContent>
                </Card>
             ))}
             {pages.length === 0 && <p className="col-span-full text-center py-10 text-gray-500">No pages found.</p>}
          </div>
       )}
    </div>
  );
}