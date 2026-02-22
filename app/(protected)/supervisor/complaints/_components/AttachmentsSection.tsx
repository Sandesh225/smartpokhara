"use client";

import { useState, useEffect } from "react";
import {
  FileIcon,
  ImageIcon,
  Paperclip,
  Maximize2,
  Download,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Attachment {
  id: string;
  file_path: string;
  file_type: string;
  file_name: string;
  created_at: string;
  uploaded_by_role?: string;
}

interface AttachmentsSectionProps {
  citizenUploads: Attachment[];
  staffUploads: Attachment[];
}

export function AttachmentsSection({
  citizenUploads = [],
  staffUploads = [],
}: AttachmentsSectionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="stone-card h-[350px] animate-pulse bg-primary/5 border-none" />
    );
  }

  const totalCount =
    (citizenUploads?.length || 0) + (staffUploads?.length || 0);

  return (
    <div className="bg-card border border-border overflow-hidden rounded-xl shadow-xs transition-colors">
      <CardHeader className="bg-muted/20 border-b border-border py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <Paperclip className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-bold text-foreground">
                Evidence Repository
              </span>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                Digital Assets & Verifications
              </p>
            </div>
          </CardTitle>
          <Badge
            variant="secondary"
            className="font-semibold text-xs px-3"
          >
            {totalCount} Items
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs defaultValue="citizen" className="w-full">
          <div className="bg-card border-b border-border px-6">
            <TabsList className="bg-transparent h-14 gap-8">
              <TabsTrigger
                value="citizen"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-none px-0 font-bold text-sm transition-all h-14 text-muted-foreground hover:text-foreground"
              >
                Citizen Intake
                <Badge variant="secondary" className="ml-2 text-xs h-5 rounded-full px-2">
                  {citizenUploads?.length || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="staff"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-none px-0 font-bold text-sm transition-all h-14 text-muted-foreground hover:text-foreground"
              >
                Field Reports
                <Badge variant="secondary" className="ml-2 text-xs h-5 rounded-full px-2">
                  {staffUploads?.length || 0}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-8 bg-transparent min-h-[300px]">
            <TabsContent
              value="citizen"
              className="mt-0 outline-none animate-in fade-in slide-in-from-left-4 duration-500"
            >
              <GalleryGrid
                files={citizenUploads}
                emptyMessage="Diagnostic: No primary evidence submitted by the reporting citizen."
              />
            </TabsContent>
            <TabsContent
              value="staff"
              className="mt-0 outline-none animate-in fade-in slide-in-from-right-4 duration-500"
            >
              <GalleryGrid
                files={staffUploads}
                emptyMessage="Diagnostic: Field verification pending. No internal media recorded."
              />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </div>
  );
}

function GalleryGrid({
  files,
  emptyMessage,
}: {
  files: Attachment[];
  emptyMessage: string;
}) {
  if (!files || files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-xl">
        <ImageIcon className="h-10 w-10 mb-3 text-muted-foreground/50" />
        <p className="text-sm font-medium text-muted-foreground max-w-[250px]">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {files.map((file) => {
        const fileUrl = file.file_path.startsWith("http")
          ? file.file_path
          : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/complaint-attachments/${file.file_path}`;

        const isImage =
          file.file_type?.toLowerCase().includes("image") ||
          file.file_name.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/i);

        return (
          <Dialog key={file.id}>
            <DialogTrigger asChild>
              <div className="group relative aspect-square bg-muted rounded-xl border border-border overflow-hidden cursor-pointer shadow-sm hover:border-primary/40 transition-all duration-300">
                {isImage ? (
                  <img
                    src={fileUrl}
                    alt={file.file_name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/400x400?text=System+Error";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-linear-to-br from-primary/5 to-transparent">
                    <FileIcon className="h-12 w-12 mb-3 text-primary/40" />
                    <span className="text-xs font-semibold text-primary/60 uppercase tracking-wider">
                      .{file.file_name.split(".").pop()} File
                    </span>
                  </div>
                )}

                {/* Aurora Overlay */}
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-all duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-[2px]">
                  <div className="bg-background/90 dark:bg-dark-midnight/90 p-3 rounded-2xl scale-50 group-hover:scale-100 transition-all duration-500 shadow-2xl border border-primary/20">
                    <Maximize2 className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </div>
            </DialogTrigger>

            <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-transparent border-none shadow-none">
              <div className="relative bg-card rounded-2xl flex flex-col max-h-[90vh] border border-border shadow-md">
                <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-muted/20">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      {file.file_name}
                    </h3>
                    <p className="text-xs font-medium text-muted-foreground mt-1">
                      Evidence Hash: {file.id.substring(0, 12)} •{" "}
                      {format(new Date(file.created_at), "PPP")}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 px-4 rounded-xl font-semibold text-xs transition-colors"
                      asChild
                    >
                      <a href={fileUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-3.5 h-3.5 mr-2" /> Open
                        Source
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      className="h-10 px-4 rounded-xl bg-primary hover:bg-primary/90 font-semibold text-xs shadow-sm text-primary-foreground"
                      asChild
                    >
                      <a href={fileUrl} download={file.file_name}>
                        <Download className="w-3.5 h-3.5 mr-2" /> Extract File
                      </a>
                    </Button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto bg-muted/5 flex items-center justify-center p-8">
                  {isImage ? (
                    <img
                      src={fileUrl}
                      alt={file.file_name}
                      className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-xs border border-border"
                    />
                  ) : (
                    <div className="text-center p-12 bg-card rounded-2xl border border-border max-w-sm shadow-sm">
                      <FileIcon className="h-20 w-20 mx-auto text-muted-foreground/30 mb-6" />
                      <p className="text-foreground font-bold text-sm">
                        Binary Data Preview
                      </p>
                      <p className="text-muted-foreground text-xs mt-3 leading-relaxed">
                        Preview generation is not supported.
                        Please extract the asset to local storage for analysis.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
      })}
    </div>
  );
}