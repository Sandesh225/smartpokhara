"use client";

import { useContentManagement } from "@/hooks/admin/useContentManagement";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function NoticesPage() {
  const { notices, loading, deleteNotice } = useContentManagement();

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Notices & Announcements</h1>
          <Button asChild>
             <Link href="/admin/content/notices/create"><Megaphone className="mr-2 h-4 w-4"/> Create Notice</Link>
          </Button>
       </div>

       {loading ? (
          <div className="text-center p-10 text-gray-500">Loading notices...</div>
       ) : (
          <div className="grid gap-4">
             {notices.map((notice) => (
                <Card key={notice.id} className={`hover:border-blue-300 transition-colors ${notice.is_urgent ? 'border-l-4 border-l-red-500' : ''}`}>
                   <CardContent className="p-4 flex items-center justify-between">
                      <div className="space-y-1">
                         <div className="flex items-center gap-2">
                            {notice.is_urgent && <Badge variant="destructive">Urgent</Badge>}
                            <h3 className="font-semibold text-lg">{notice.title}</h3>
                            <Badge variant="outline" className="capitalize">{notice.notice_type}</Badge>
                         </div>
                         <p className="text-sm text-gray-600 line-clamp-1">{notice.excerpt}</p>
                         <div className="text-xs text-gray-400 flex gap-2">
                            <span>Posted by {notice.creator?.full_name}</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(notice.published_at))} ago</span>
                            <span>•</span>
                            <span>{notice.ward ? `Ward ${notice.ward.ward_number}` : (notice.is_public ? 'Public' : 'Internal')}</span>
                         </div>
                      </div>
                      <div className="flex gap-2">
                         <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/content/notices/${notice.id}/edit`}>
                                <Edit className="h-4 w-4 text-gray-500" />
                            </Link>
                         </Button>
                         <Button variant="ghost" size="icon" onClick={() => deleteNotice(notice.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                         </Button>
                      </div>
                   </CardContent>
                </Card>
             ))}
             {notices.length === 0 && <p className="text-center text-gray-500 py-10">No notices found.</p>}
          </div>
       )}
    </div>
  );
}