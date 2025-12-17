"use client";

import { useForm } from "react-hook-form";
import { useContentManagement } from "@/hooks/admin/useContentManagement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { PageInput } from "@/types/admin-content";
import { Label } from "@/components/ui/label";

export default function CreatePage() {
  const { createPage } = useContentManagement();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<PageInput>();

  const onSubmit = (data: PageInput) => {
      createPage({ ...data, content: { html: data.content }, status: 'published' });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" asChild>
                <Link href="/admin/content/pages"><ArrowLeft className="h-5 w-5"/></Link>
             </Button>
             <h1 className="text-2xl font-bold">New Page</h1>
          </div>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
             <Save className="mr-2 h-4 w-4" /> Save Page
          </Button>
       </div>

       <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
             <Card>
                <CardContent className="p-6 space-y-4">
                   <div className="space-y-2">
                      <Label>Page Title</Label>
                      <Input {...register("title", { required: true })} placeholder="e.g. About Smart City" />
                   </div>
                   <div className="space-y-2">
                      <Label>Content (HTML)</Label>
                      <Textarea {...register("content", { required: true })} className="h-[400px] font-mono" placeholder="<p>Page content...</p>" />
                   </div>
                </CardContent>
             </Card>
          </div>

          <div className="space-y-6">
             <Card>
                <CardContent className="p-6 space-y-4">
                   <div className="space-y-2">
                      <Label>URL Slug</Label>
                      <Input {...register("slug", { required: true })} placeholder="about-us" />
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