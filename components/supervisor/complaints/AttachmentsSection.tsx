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

interface Attachment {
  id: string;
  file_path: string;
  file_type: string;
  file_name: string;
  created_at: string;
}

interface AttachmentsSectionProps {
  citizenUploads: Attachment[];
  staffUploads: Attachment[];
}

export function AttachmentsSection({
  citizenUploads,
  staffUploads,
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

  return (
    <Card className="shadow-sm border-gray-200 overflow-hidden">
      <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Paperclip className="h-4 w-4 text-gray-500" /> Evidence & Files
          </CardTitle>
          <span className="text-xs font-medium bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
            Total: {citizenUploads.length + staffUploads.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="citizen" className="w-full">
          <div className="border-b border-gray-100 px-4">
            <TabsList className="bg-transparent h-12">
              <TabsTrigger
                value="citizen"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-4"
              >
                Citizen Uploads ({citizenUploads.length})
              </TabsTrigger>
              <TabsTrigger
                value="staff"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-4"
              >
                Staff Uploads ({staffUploads.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6 bg-white min-h-[200px]">
            <TabsContent value="citizen" className="mt-0">
              <GalleryGrid
                files={citizenUploads}
                emptyMessage="No evidence uploaded by citizen."
              />
            </TabsContent>
            <TabsContent value="staff" className="mt-0">
              <GalleryGrid
                files={staffUploads}
                emptyMessage="No resolution proof uploaded yet."
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
      <div className="flex flex-col items-center justify-center py-10 text-gray-400">
        <ImageIcon className="h-10 w-10 mb-2 opacity-20" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {files.map((file) => {
        // Safe URL generation
        const fileUrl = file.file_path.startsWith("http")
          ? file.file_path
          : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/complaint-attachments/${file.file_path}`;

        const isImage =
          file.file_type?.includes("image") ||
          file.file_name.match(/\.(jpg|jpeg|png|gif|webp)$/i);

        return (
          <Dialog key={file.id}>
            <DialogTrigger asChild>
              <div className="group relative aspect-square bg-gray-100 rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-all">
                {isImage ? (
                  // Use standard img tag to bypass Next.js config restrictions
                  <img
                    src={fileUrl}
                    alt={file.file_name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/400x400?text=Image+Error";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 p-2">
                    <FileIcon className="h-8 w-8 mb-2" />
                    <span className="text-[10px] px-1 text-center truncate w-full leading-tight">
                      {file.file_name}
                    </span>
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Maximize2 className="h-6 w-6 text-white drop-shadow-md" />
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-transparent border-none shadow-none">
              <div className="relative bg-white rounded-lg shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 border-b">
                  <div>
                    <h3 className="font-medium text-gray-900 truncate max-w-xs">
                      {file.file_name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Uploaded {new Date(file.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={fileUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" /> Open
                      </a>
                    </Button>
                    <Button size="sm" asChild>
                      <a href={fileUrl} download>
                        <Download className="w-4 h-4 mr-2" /> Download
                      </a>
                    </Button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-4 min-h-[400px]">
                  {isImage ? (
                    <img
                      src={fileUrl}
                      alt={file.file_name}
                      className="max-w-full max-h-[70vh] object-contain shadow-lg rounded-md"
                    />
                  ) : (
                    <div className="text-center p-10">
                      <FileIcon className="h-20 w-20 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">
                        Preview not available for this file type.
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