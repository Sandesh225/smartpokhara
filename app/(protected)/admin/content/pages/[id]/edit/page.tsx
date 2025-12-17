"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useContentManagement } from "@/hooks/admin/useContentManagement";
import { adminContentQueries } from "@/lib/supabase/queries/admin/content";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { PageInput } from "@/types/admin-content";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function EditPage() {
  const { id } = useParams();
  const { updatePage } = useContentManagement();
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  
  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm<PageInput>();

  useEffect(() => {
    const loadPage = async () => {
       try {
         const data = await adminContentQueries.getPageById(supabase, id as string);
         if (data) {
            setValue("title", data.title);
            setValue("slug", data.slug);
            // Assuming simple HTML storage for this demo, extract from JSONB if needed
            setValue("content", typeof data.content === 'string' ? data.content : data.content?.html || ""); 
            setValue("meta_title", data.meta_title || "");
            setValue("meta_description", data.meta_description || "");
            setValue("status", data.status);
         }
       } catch (e) {
         toast.error("Failed to load page");
       } finally {
         setLoading(false);
       }
    };
    if (id) loadPage();
  }, [id, supabase, setValue]);

  const onSubmit = (data: PageInput) => {
      updatePage(id as string, { ...data, content: { html: data.content } });
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600"/></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" asChild>
                <Link href="/admin/content/pages"><ArrowLeft className="h-5 w-5"/></Link>
             </Button>
             <h1 className="text-2xl font-bold">Edit Page</h1>
          </div>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
             <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
       </div>

       <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
             <Card>
                <CardContent className="p-6 space-y-4">
                   <div className="space-y-2">
                      <Label>Page Title</Label>
                      <Input {...register("title", { required: true })} />
                   </div>
                   <div className="space-y-2">
                      <Label>Content (HTML)</Label>
                      <Textarea {...register("content", { required: true })} className="h-[400px] font-mono" />
                   </div>
                </CardContent>
             </Card>
          </div>

          <div className="space-y-6">
             <Card>
                <CardContent className="p-6 space-y-4">
                   <div className="space-y-2">
                      <Label>Status</Label>
                      <Select onValueChange={(v: any) => setValue("status", v)} defaultValue="draft">
                         <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                         <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                         </SelectContent>
                      </Select>
                   </div>
                   <div className="space-y-2">
                      <Label>URL Slug</Label>
                      <Input {...register("slug", { required: true })} />
                   </div>
                   <div className="space-y-2">
                      <Label>Meta Title</Label>
                      <Input {...register("meta_title")} />
                   </div>
                   <div className="space-y-2">
                      <Label>Meta Description</Label>
                      <Textarea {...register("meta_description")} className="h-24" />
                   </div>
                </CardContent>
             </Card>
          </div>
       </div>
    </div>
  );
}