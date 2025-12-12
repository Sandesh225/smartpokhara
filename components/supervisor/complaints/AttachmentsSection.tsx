"use client";

import { FileText, Image as ImageIcon, Download } from "lucide-react";

interface Attachment {
  id: string;
  file_path: string;
  file_type: string;
  created_at: string;
}

interface AttachmentsSectionProps {
  citizenUploads: Attachment[];
  staffUploads: Attachment[];
}

export function AttachmentsSection({ citizenUploads, staffUploads }: AttachmentsSectionProps) {
  const renderList = (files: Attachment[], emptyMsg: string) => {
    if (files.length === 0) return <p className="text-sm text-gray-500 italic py-2">{emptyMsg}</p>;
    
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {files.map((file) => (
          <div key={file.id} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
            {file.file_type.startsWith("image/") ? (
               <div className="w-full h-full flex items-center justify-center text-gray-400">
                 <ImageIcon className="h-8 w-8" />
                 {/* In real app: <img src={...} /> */}
               </div>
            ) : (
               <div className="w-full h-full flex items-center justify-center text-gray-400">
                 <FileText className="h-8 w-8" />
               </div>
            )}
            <a 
              href="#" // Needs storage URL generation
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
              download
            >
              <Download className="h-6 w-6" />
            </a>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-base font-semibold text-gray-900">Attachments</h3>
      </div>
      <div className="p-6 space-y-6">
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Citizen Uploads</h4>
          {renderList(citizenUploads, "No files uploaded by citizen.")}
        </div>
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Staff Uploads</h4>
          {renderList(staffUploads, "No files uploaded by staff.")}
        </div>
      </div>
    </div>
  );
}