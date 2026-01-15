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
    <div className="stone-card dark:stone-card-elevated overflow-hidden transition-colors-smooth border-none shadow-2xl">
      <CardHeader className="bg-primary/5 dark:bg-dark-surface/40 border-b border-primary/10 py-5">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <Paperclip className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground dark:text-glow">
                Evidence Repository
              </span>
              <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">
                Digital Assets & Verifications
              </p>
            </div>
          </CardTitle>
          <Badge
            variant="outline"
            className="border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-tighter px-3"
          >
            Verified Items: {totalCount}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs defaultValue="citizen" className="w-full">
          <div className="bg-muted/30 dark:bg-dark-midnight/40 border-b border-primary/5 px-6">
            <TabsList className="bg-transparent h-14 gap-8">
              <TabsTrigger
                value="citizen"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none px-0 font-black text-[10px] uppercase tracking-widest transition-all h-14"
              >
                Citizen Intake
                <Badge className="ml-2 bg-primary/10 text-primary border-none text-[9px] h-4">
                  {citizenUploads?.length || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="staff"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none px-0 font-black text-[10px] uppercase tracking-widest transition-all h-14"
              >
                Field Reports
                <Badge className="ml-2 bg-primary/10 text-primary border-none text-[9px] h-4">
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
      <div className="flex flex-col items-center justify-center py-16 text-center glass border-2 border-dashed border-primary/10 rounded-3xl">
        <ImageIcon className="h-12 w-12 mb-4 text-primary/20" />
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest max-w-[250px] leading-relaxed">
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
              <div className="group relative aspect-square glass dark:bg-dark-surface/50 rounded-2xl border border-primary/10 overflow-hidden cursor-pointer shadow-xl hover:border-primary/40 transition-all duration-500">
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
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary/5 to-transparent">
                    <FileIcon className="h-12 w-12 mb-3 text-primary/40" />
                    <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest">
                      .{file.file_name.split(".").pop()} Protocol
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

            <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-transparent border-none shadow-[0_0_50px_-12px_rgba(var(--primary-brand),0.5)]">
              <div className="relative glass dark:bg-dark-midnight rounded-3xl flex flex-col max-h-[90vh] border border-primary/20">
                <div className="flex justify-between items-center px-8 py-5 border-b border-primary/10 backdrop-blur-xl">
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      {file.file_name}
                    </h3>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">
                      Evidence Hash: {file.id.substring(0, 12)} •{" "}
                      {format(new Date(file.created_at), "PPP")}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 px-4 rounded-xl border-primary/20 font-black uppercase tracking-widest text-[10px] hover:bg-primary/5"
                      asChild
                    >
                      <a href={fileUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-3.5 h-3.5 mr-2" /> Open
                        Source
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      className="h-10 px-4 rounded-xl bg-primary hover:bg-primary-brand-light font-black uppercase tracking-widest text-[10px] shadow-lg accent-glow"
                      asChild
                    >
                      <a href={fileUrl} download={file.file_name}>
                        <Download className="w-3.5 h-3.5 mr-2" /> Extract File
                      </a>
                    </Button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto bg-primary/5 dark:bg-dark-midnight/20 flex items-center justify-center p-10">
                  {isImage ? (
                    <img
                      src={fileUrl}
                      alt={file.file_name}
                      className="max-w-full max-h-[65vh] object-contain shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl border border-primary/10 transition-colors-smooth"
                    />
                  ) : (
                    <div className="text-center p-16 glass dark:bg-dark-surface-elevated rounded-[40px] border border-primary/10 max-w-sm shadow-2xl">
                      <FileIcon className="h-24 w-24 mx-auto text-primary/10 mb-8" />
                      <p className="text-foreground font-black uppercase tracking-widest text-xs">
                        Binary Data Preview
                      </p>
                      <p className="text-muted-foreground text-[10px] mt-4 leading-relaxed font-bold uppercase tracking-tighter">
                        Preview generation is not supported for this protocol.
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