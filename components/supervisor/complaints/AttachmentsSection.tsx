"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FileIcon, ImageIcon, Paperclip, Maximize2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
                emptyMessage="No files uploaded by citizen."
              />
            </TabsContent>
            <TabsContent value="staff" className="mt-0">
              <GalleryGrid
                files={staffUploads}
                emptyMessage="No files uploaded by staff."
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
  if (files.length === 0) {
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
        const isImage = file.file_type?.startsWith("image/");
        return (
          <Dialog key={file.id}>
            <DialogTrigger asChild>
              <div className="group relative aspect-square bg-gray-100 rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-all">
                {isImage ? (
                  <Image
                    src={file.file_path}
                    alt={file.file_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                    <FileIcon className="h-8 w-8 mb-2" />
                    <span className="text-xs px-2 text-center truncate w-full">
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
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none">
              {isImage ? (
                <div className="relative w-full h-[80vh]">
                  <Image
                    src={file.file_path}
                    alt={file.file_name}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="bg-white p-10 rounded-lg text-center">
                  <FileIcon className="h-16 w-16 mx-auto text-blue-600 mb-4" />
                  <h3 className="text-lg font-bold">{file.file_name}</h3>
                  <a
                    href={file.file_path}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-4 text-blue-600 hover:underline"
                  >
                    Download File
                  </a>
                </div>
              )}
            </DialogContent>
          </Dialog>
        );
      })}
    </div>
  );
}