// components/citizen/complaints/AttachmentsGallery.tsx
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';
import { Separator } from '@/ui//separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog';
import {
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Video,
  File,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Shield,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import type { ComplaintAttachment } from '@/lib/supabase/queries/complaints';

interface AttachmentsGalleryProps {
  attachments: ComplaintAttachment[];
  isLoading?: boolean;
}

export function AttachmentsGallery({ attachments, isLoading = false }: AttachmentsGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Separate attachments by uploader
  const citizenAttachments = attachments.filter(a => a.uploaded_by_role === 'citizen');
  const staffAttachments = attachments.filter(a => a.uploaded_by_role === 'staff');

  // Filter attachments by type
  const imageAttachments = attachments.filter(a => a.file_type?.startsWith('image/'));
  const videoAttachments = attachments.filter(a => a.file_type?.startsWith('video/'));
  const documentAttachments = attachments.filter(a => 
    a.file_type?.includes('pdf') || 
    a.file_type?.includes('document') ||
    a.file_type?.includes('text') ||
    !a.file_type?.startsWith('image/') && !a.file_type?.startsWith('video/')
  );

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <File className="h-8 w-8" />;
    if (fileType.startsWith('image/')) return <ImageIcon className="h-8 w-8" />;
    if (fileType.startsWith('video/')) return <Video className="h-8 w-8" />;
    if (fileType.includes('pdf')) return <FileText className="h-8 w-8" />;
    return <File className="h-8 w-8" />;
  };

  const getFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = (attachment: ComplaintAttachment) => {
    const link = document.createElement('a');
    link.href = attachment.file_path;
    link.download = attachment.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openLightbox = (index: number) => {
    setSelectedImage(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setSelectedImage(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImage === null) return;
    
    const currentAttachments = activeTab === 'images' 
      ? imageAttachments 
      : attachments.filter(a => a.file_type?.startsWith('image/'));
    
    if (direction === 'prev') {
      setSelectedImage(selectedImage > 0 ? selectedImage - 1 : currentAttachments.length - 1);
    } else {
      setSelectedImage(selectedImage < currentAttachments.length - 1 ? selectedImage + 1 : 0);
    }
  };

  const AttachmentCard = ({ attachment, index }: { attachment: ComplaintAttachment; index: number }) => {
    const isImage = attachment.file_type?.startsWith('image/');
    const isVideo = attachment.file_type?.startsWith('video/');
    
    return (
      <div className="group relative border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        {/* Image Preview */}
        {isImage ? (
          <div 
            className="aspect-video overflow-hidden bg-slate-100 cursor-pointer"
            onClick={() => openLightbox(index)}
          >
            <img
              src={attachment.file_path}
              alt={attachment.file_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
        ) : (
          <div className="aspect-video bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="text-slate-400 mb-2">
              {getFileIcon(attachment.file_type)}
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-slate-700 truncate max-w-[200px]">
                {attachment.file_name}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {getFileSize(attachment.file_size)}
              </div>
            </div>
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
          <div className="p-3 w-full">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <div className="text-sm font-medium truncate">
                  {attachment.file_name}
                </div>
                <div className="text-xs opacity-90">
                  {getFileSize(attachment.file_size)}
                </div>
              </div>
              <div className="flex gap-1">
                {isImage && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 bg-white/20 hover:bg-white/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      openLightbox(index);
                    }}
                  >
                    <Eye className="h-4 w-4 text-white" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 bg-white/20 hover:bg-white/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(attachment);
                  }}
                >
                  <Download className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Uploader Badge */}
        <div className="absolute top-2 left-2">
          <Badge variant={attachment.uploaded_by_role === 'staff' ? 'default' : 'outline'} className="gap-1">
            {attachment.uploaded_by_role === 'staff' ? (
              <Shield className="h-3 w-3" />
            ) : (
              <User className="h-3 w-3" />
            )}
            {attachment.uploaded_by_role === 'staff' ? 'Staff' : 'You'}
          </Badge>
        </div>
        
        {/* File Info */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-slate-900 truncate">
              {attachment.file_name}
            </div>
            <Badge variant="outline" className="text-xs">
              {attachment.file_type?.split('/')[1] || 'File'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(attachment.created_at), 'MMM dd')}
            </div>
            <span>{getFileSize(attachment.file_size)}</span>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Attachments</CardTitle>
          <CardDescription>Loading attachments...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-video bg-slate-100 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (attachments.length === 0) {
    return (
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Attachments</CardTitle>
          <CardDescription>No files or images attached</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <ImageIcon className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No attachments
            </h3>
            <p className="text-slate-600 max-w-md mx-auto">
              No files or images have been uploaded for this complaint.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Attachments</CardTitle>
          <CardDescription>
            Files and images related to this complaint
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="all" onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">
                All ({attachments.length})
              </TabsTrigger>
              <TabsTrigger value="images">
                <ImageIcon className="h-4 w-4 mr-2" />
                Images ({imageAttachments.length})
              </TabsTrigger>
              <TabsTrigger value="documents">
                <FileText className="h-4 w-4 mr-2" />
                Documents ({documentAttachments.length})
              </TabsTrigger>
              <TabsTrigger value="uploader">
                By Uploader
              </TabsTrigger>
            </TabsList>
            
            {/* All Attachments */}
            <TabsContent value="all">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {attachments.map((attachment, index) => (
                  <AttachmentCard 
                    key={attachment.id} 
                    attachment={attachment} 
                    index={index} 
                  />
                ))}
              </div>
            </TabsContent>
            
            {/* Images Only */}
            <TabsContent value="images">
              {imageAttachments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {imageAttachments.map((attachment, index) => (
                    <AttachmentCard 
                      key={attachment.id} 
                      attachment={attachment} 
                      index={index} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ImageIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No images found</p>
                </div>
              )}
            </TabsContent>
            
            {/* Documents Only */}
            <TabsContent value="documents">
              {documentAttachments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documentAttachments.map((attachment, index) => (
                    <AttachmentCard 
                      key={attachment.id} 
                      attachment={attachment} 
                      index={index} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No documents found</p>
                </div>
              )}
            </TabsContent>
            
            {/* By Uploader */}
            <TabsContent value="uploader" className="space-y-6">
              {/* Citizen Uploads */}
              {citizenAttachments.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-slate-500" />
                    <h3 className="font-semibold text-slate-900">Your Uploads</h3>
                    <Badge variant="outline">{citizenAttachments.length}</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {citizenAttachments.map((attachment, index) => (
                      <AttachmentCard 
                        key={attachment.id} 
                        attachment={attachment} 
                        index={index} 
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Staff Uploads */}
              {staffAttachments.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-5 w-5 text-slate-500" />
                    <h3 className="font-semibold text-slate-900">Staff Uploads</h3>
                    <Badge variant="default">{staffAttachments.length}</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {staffAttachments.map((attachment, index) => (
                      <AttachmentCard 
                        key={attachment.id} 
                        attachment={attachment} 
                        index={index} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {/* Summary */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-sm text-slate-600">
                  <span className="font-medium">{attachments.length}</span> total files
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <ImageIcon className="h-4 w-4" />
                  <span>{imageAttachments.length} images</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FileText className="h-4 w-4" />
                  <span>{documentAttachments.length} documents</span>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Download all attachments as zip
                  alert('This would download all attachments as a ZIP file');
                }}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 overflow-hidden">
          {selectedImage !== null && (
            <div className="relative h-full">
              {/* Navigation buttons */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 h-10 w-10 bg-black/30 hover:bg-black/50 text-white"
                onClick={() => navigateImage('prev')}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 h-10 w-10 bg-black/30 hover:bg-black/50 text-white"
                onClick={() => navigateImage('next')}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
              
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 z-10 h-10 w-10 bg-black/30 hover:bg-black/50 text-white"
                onClick={closeLightbox}
              >
                <X className="h-6 w-6" />
              </Button>
              
              {/* Image */}
              <div className="h-full flex items-center justify-center bg-black">
                <img
                  src={attachments[selectedImage].file_path}
                  alt={attachments[selectedImage].file_name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              
              {/* Image info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {attachments[selectedImage].file_name}
                    </div>
                    <div className="text-sm opacity-90">
                      {getFileSize(attachments[selectedImage].file_size)} • 
                      Image {selectedImage + 1} of {imageAttachments.length}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDownload(attachments[selectedImage])}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}