"use client";

import Image from "next/image";
import { FileIcon, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Attachment {
  id: string;
  file_name: string;
  file_type: "photo" | "video" | "document" | "audio";
  signedUrl: string;
}

interface Props {
  attachments: Attachment[];
  canDelete: boolean;
}

export function ComplaintAttachmentsSection({ attachments, canDelete }: Props) {
  if (!attachments || attachments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No attachments uploaded for this complaint.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {attachments.map((file) => (
        <div
          key={file.id}
          className="group relative border rounded-lg overflow-hidden bg-gray-50 hover:shadow-md transition-all"
        >
          {file.file_type === "photo" || 
           file.file_name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
            <div className="aspect-square relative">
              <Image
                src={file.signedUrl}
                alt={file.file_name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="aspect-square flex flex-col items-center justify-center p-4">
              <FileIcon className="w-10 h-10 text-gray-400 mb-2" />
              <span className="text-xs text-center text-gray-500 truncate w-full px-2">
                {file.file_name}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <a
              href={file.signedUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" size="sm" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                View
              </Button>
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}