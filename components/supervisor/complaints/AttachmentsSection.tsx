"use client";

import { useState, useEffect } from "react";
import {
  FileIcon,
  ImageIcon,
  Paperclip,
  Maximize2,
  Download,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

/**
 * Visualizes evidence files attached to a complaint.
 * Robustly handles direct Supabase Storage URLs and relative paths.
 */
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
      <Card className="shadow-sm border-gray-200 overflow-hidden h-[300px] animate-pulse bg-gray-50" />
    );
  }

  const totalCount =
    (citizenUploads?.length || 0) + (staffUploads?.length || 0);

  return (
    <Card className="shadow-sm border-gray-200 overflow-hidden animate-in fade-in duration-500">
      <CardHeader className="bg-white border-b border-gray-100 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Paperclip className="h-4 w-4 text-blue-600" />
            Evidence & Files
          </CardTitle>
          <Badge
            variant="secondary"
            className="bg-slate-100 text-slate-700 font-bold px-2.5"
          >
            Files Found: {totalCount}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="citizen" className="w-full">
          <div className="bg-slate-50/50 border-b border-gray-100 px-4">
            <TabsList className="bg-transparent h-12 gap-6">
              <TabsTrigger
                value="citizen"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:shadow-none rounded-none px-2 font-bold text-sm transition-all"
              >
                Citizen Uploads
                <span className="ml-2 bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md text-[10px]">
                  {citizenUploads?.length || 0}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="staff"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:shadow-none rounded-none px-2 font-bold text-sm transition-all"
              >
                Internal Proof
                <span className="ml-2 bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md text-[10px]">
                  {staffUploads?.length || 0}
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6 bg-white min-h-[240px]">
            <TabsContent value="citizen" className="mt-0 outline-none">
              <GalleryGrid
                files={citizenUploads}
                emptyMessage="No evidence was submitted by the citizen for this complaint."
              />
            </TabsContent>
            <TabsContent value="staff" className="mt-0 outline-none">
              <GalleryGrid
                files={staffUploads}
                emptyMessage="No resolution photos or field reports uploaded by staff yet."
              />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
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
      <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50/30 rounded-xl border border-dashed border-slate-200">
        <ImageIcon className="h-10 w-10 mb-3 text-slate-300 opacity-50" />
        <p className="text-sm font-medium text-slate-500 max-w-[200px]">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
      {files.map((file) => {
        // Safe URL handler for both absolute paths and relative Supabase keys
        const fileUrl = file.file_path.startsWith("http")
          ? file.file_path
          : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/complaint-attachments/${file.file_path}`;

        const isImage =
          file.file_type?.toLowerCase().includes("image") ||
          file.file_name.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/i);

        return (
          <Dialog key={file.id}>
            <DialogTrigger asChild>
              <div className="group relative aspect-square bg-slate-100 rounded-xl border border-slate-200 overflow-hidden cursor-pointer shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300">
                {isImage ? (
                  <img
                    src={fileUrl}
                    alt={file.file_name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/400x400?text=Preview+Unavailable";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100">
                    <FileIcon className="h-10 w-10 mb-2 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500 text-center truncate w-full px-2 uppercase tracking-tighter">
                      {file.file_name.split(".").pop()} FILE
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="bg-white/90 p-2 rounded-full scale-50 group-hover:scale-100 transition-transform duration-300 shadow-xl">
                    <Maximize2 className="h-5 w-5 text-blue-700" />
                  </div>
                </div>
              </div>
            </DialogTrigger>

            <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-transparent border-none shadow-2xl">
              <div className="relative bg-white rounded-2xl flex flex-col max-h-[85vh]">
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 truncate flex items-center gap-2 pr-4">
                      {file.file_name}
                    </h3>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                      File ID: {file.id.substring(0, 8)} •{" "}
                      {new Date(file.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 font-bold text-slate-600 hidden sm:flex"
                      asChild
                    >
                      <a href={fileUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" /> Open
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      className="h-9 font-bold bg-blue-600 hover:bg-blue-700"
                      asChild
                    >
                      <a href={fileUrl} download={file.file_name}>
                        <Download className="w-4 h-4 mr-2" /> Download
                      </a>
                    </Button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto bg-slate-50 flex items-center justify-center p-8">
                  {isImage ? (
                    <img
                      src={fileUrl}
                      alt={file.file_name}
                      className="max-w-full max-h-[60vh] object-contain shadow-2xl rounded-lg"
                    />
                  ) : (
                    <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-sm">
                      <FileIcon className="h-24 w-24 mx-auto text-slate-100 mb-6" />
                      <p className="text-slate-700 font-bold">
                        Preview Unsupported
                      </p>
                      <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                        This file format cannot be rendered in the dashboard.
                        Please download the file to view its contents.
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