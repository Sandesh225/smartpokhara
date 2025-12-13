// components/citizen/complaints/StaffUpdates.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';
import { Button } from '@/ui/button';
import { Separator } from '@/ui//separator';
import {
  MessageSquare,
  User,
  Calendar,
  FileText,
  Image as ImageIcon,
  Video,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Clock,
  Shield,
  ExternalLink,
} from 'lucide-react';
import type { ComplaintComment } from '@/lib/supabase/queries/complaints';

interface StaffUpdatesProps {
  updates: ComplaintComment[];
  isSubscribed?: boolean;
  isLoading?: boolean;
}

interface StaffUpdate {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  staffName: string;
  staffRole: string;
  staffAvatar?: string;
  attachments?: any[];
  isInternal?: boolean;
  isResolution?: boolean;
}

export function StaffUpdates({ updates, isSubscribed = false, isLoading = false }: StaffUpdatesProps) {
  const [expandedUpdates, setExpandedUpdates] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'updates' | 'resolution'>('all');
  const containerRef = useRef<HTMLDivElement>(null);

  // Transform comments into staff updates
  const staffUpdates: StaffUpdate[] = updates
    .filter(comment => comment.author_role === 'staff' && !comment.is_internal)
    .map(comment => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      staffName: comment.author?.full_name || 'Municipal Staff',
      staffRole: 'Municipal Officer',
      staffAvatar: comment.author?.profile_photo_url || undefined,
      attachments: comment.attachments,
      isInternal: comment.is_internal,
      isResolution: comment.content.toLowerCase().includes('resolved') || 
                   comment.content.toLowerCase().includes('resolution'),
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Filter updates based on selection
  const filteredUpdates = staffUpdates.filter(update => {
    if (filter === 'updates') return !update.isResolution;
    if (filter === 'resolution') return update.isResolution;
    return true;
  });

  const hasResolution = staffUpdates.some(update => update.isResolution);
  const hasUpdates = staffUpdates.some(update => !update.isResolution);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedUpdates);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedUpdates(newExpanded);
  };

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  // Auto-scroll when new updates arrive
  useEffect(() => {
    if (isSubscribed) {
      scrollToBottom();
    }
  }, [staffUpdates, isSubscribed]);

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const updateDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - updateDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} day${Math.floor(diffInHours / 24) !== 1 ? 's' : ''} ago`;
    return format(updateDate, 'MMM dd, yyyy');
  };

  if (isLoading) {
    return (
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Staff Updates</CardTitle>
          <CardDescription>Loading updates...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-slate-200 animate-pulse rounded" />
                  <div className="h-16 bg-slate-100 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (staffUpdates.length === 0) {
    return (
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Staff Updates</CardTitle>
              <CardDescription>
                Public updates from municipal staff
              </CardDescription>
            </div>
            {isSubscribed && (
              <Badge variant="outline" className="animate-pulse">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                Live Updates
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No updates yet
            </h3>
            <p className="text-slate-600 max-w-md mx-auto mb-6">
              Municipal staff will post updates here as they work on your complaint.
              Check back later for progress reports.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <Clock className="h-4 w-4" />
              <span>Updates typically appear within 24-48 hours</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Staff Updates</CardTitle>
            <CardDescription>
              Public updates from municipal staff ({staffUpdates.length})
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            {isSubscribed && (
              <Badge variant="outline" className="animate-pulse">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                Live Updates
              </Badge>
            )}
            
            {/* Filter buttons */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <Button
                variant={filter === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('all')}
                className="h-7 px-3"
              >
                All
              </Button>
              {hasUpdates && (
                <Button
                  variant={filter === 'updates' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('updates')}
                  className="h-7 px-3"
                >
                  Updates
                </Button>
              )}
              {hasResolution && (
                <Button
                  variant={filter === 'resolution' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('resolution')}
                  className="h-7 px-3"
                >
                  Resolution
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div 
          ref={containerRef}
          className="space-y-6 max-h-[600px] overflow-y-auto pr-2"
          style={{ scrollBehavior: 'smooth' }}
        >
          {filteredUpdates.map((update) => {
            const isExpanded = expandedUpdates.has(update.id);
            const isLongContent = update.content.length > 300;
            const displayContent = isExpanded || !isLongContent 
              ? update.content 
              : update.content.slice(0, 300) + '...';
            
            return (
              <div key={update.id} className="group">
                <div className="flex gap-4">
                  {/* Staff Avatar */}
                  <div className="flex-shrink-0">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                      {update.staffAvatar ? (
                        <AvatarImage src={update.staffAvatar} alt={update.staffName} />
                      ) : (
                        <AvatarFallback className="bg-blue-100 text-blue-800">
                          {update.staffName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    {/* Timeline line */}
                    <div className="w-0.5 h-full bg-slate-200 mx-auto mt-2" />
                  </div>
                  
                  {/* Update Content */}
                  <div className="flex-1 pb-6">
                    <div className="mb-3">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-900">
                          {update.staffName}
                        </h4>
                        <Badge variant="outline" className="gap-1">
                          <Shield className="h-3 w-3" />
                          {update.staffRole}
                        </Badge>
                        
                        {update.isResolution && (
                          <Badge variant="default" className="gap-1 bg-green-500 hover:bg-green-600">
                            <CheckCircle className="h-3 w-3" />
                            Resolution Update
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(update.createdAt), 'MMM dd, yyyy')}</span>
                        <span className="text-slate-300">•</span>
                        <span>{format(new Date(update.createdAt), 'hh:mm a')}</span>
                        <span className="text-slate-300">•</span>
                        <span>{formatTimeAgo(update.createdAt)}</span>
                        
                        {update.updatedAt && update.updatedAt !== update.createdAt && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-amber-600 text-xs">
                              Updated
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Update Text */}
                    <div className={`bg-slate-50 rounded-lg p-4 mb-3 ${
                      update.isResolution ? 'border-l-4 border-green-500' : ''
                    }`}>
                      <div className="prose prose-slate max-w-none">
                        <p className="text-slate-700 whitespace-pre-line">
                          {displayContent}
                        </p>
                      </div>
                      
                      {/* Expand/Collapse */}
                      {isLongContent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(update.id)}
                          className="mt-3 h-7 text-sm"
                        >
                          {isExpanded ? 'Show less' : 'Read more'}
                        </Button>
                      )}
                    </div>
                    
                    {/* Attachments */}
                    {update.attachments && update.attachments.length > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center gap-2 mb-2 text-sm text-slate-600">
                          <FileText className="h-4 w-4" />
                          <span className="font-medium">Attachments</span>
                          <Badge variant="outline" className="text-xs">
                            {update.attachments.length}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {update.attachments.slice(0, 3).map((attachment, index) => {
                            const isImage = attachment.file_type?.startsWith('image/');
                            const isVideo = attachment.file_type?.startsWith('video/');
                            
                            return (
                              <div
                                key={index}
                                className="border rounded-lg overflow-hidden group/attachment"
                              >
                                {isImage ? (
                                  <div className="aspect-video overflow-hidden bg-slate-100">
                                    <img
                                      src={attachment.file_path}
                                      alt={attachment.file_name}
                                      className="w-full h-full object-cover group-hover/attachment:scale-105 transition-transform"
                                    />
                                  </div>
                                ) : (
                                  <div className="aspect-video bg-slate-50 flex items-center justify-center">
                                    {isVideo ? (
                                      <Video className="h-8 w-8 text-slate-400" />
                                    ) : (
                                      <FileText className="h-8 w-8 text-slate-400" />
                                    )}
                                  </div>
                                )}
                                
                                <div className="p-2">
                                  <div className="text-xs font-medium truncate">
                                    {attachment.file_name}
                                  </div>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs text-slate-500">
                                      {isImage ? 'Image' : isVideo ? 'Video' : 'File'}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => window.open(attachment.file_path, '_blank')}
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          
                          {update.attachments.length > 3 && (
                            <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-slate-600">
                                  +{update.attachments.length - 3}
                                </div>
                                <div className="text-xs text-slate-500">more</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* End of updates indicator */}
          <div className="text-center pt-4 border-t border-slate-200">
            <div className="inline-flex items-center gap-2 text-sm text-slate-500">
              <CheckCircle className="h-4 w-4" />
              <span>You're up to date with all staff updates</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              New updates will appear here automatically
            </p>
          </div>
        </div>
        
        {/* Update statistics */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-slate-900">Update Statistics</h4>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{staffUpdates.length} total updates</span>
                </div>
                {hasResolution && (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{staffUpdates.filter(u => u.isResolution).length} resolution updates</span>
                  </div>
                )}
                {hasUpdates && (
                  <div className="flex items-center gap-1">
                    <RefreshCw className="h-4 w-4 text-blue-500" />
                    <span>{staffUpdates.filter(u => !u.isResolution).length} progress updates</span>
                  </div>
                )}
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={scrollToBottom}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Scroll to latest
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}