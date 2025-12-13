// components/citizen/complaints/ComplaintDetails.tsx
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { Button } from '@/ui/button';
import { Separator } from '@/ui//separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';
import {
  MapPin,
  Calendar,
  Phone,
  Mail,
  Eye,
  EyeOff,
  FileText,
  Image,
  Download,
  ExternalLink,
  AlertCircle,
  Shield,
} from 'lucide-react';
import type { Complaint } from '@/lib/supabase/queries/complaints';

// Dynamically import the map component for better performance
const MiniMap = dynamic(() => import('./MiniMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[200px] w-full bg-slate-100 animate-pulse rounded-lg"></div>
  ),
});

interface ComplaintDetailsProps {
  complaint: Complaint;
  showPriority?: boolean;
  showContactInfo?: boolean;
}

export function ComplaintDetails({ 
  complaint, 
  showPriority = false,
  showContactInfo = true 
}: ComplaintDetailsProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showContactDetails, setShowContactDetails] = useState(
    !complaint.is_anonymous && showContactInfo
  );

  // Format coordinates for display
  const coordinates = complaint.location_point?.coordinates
    ? {
        lng: complaint.location_point.coordinates[0],
        lat: complaint.location_point.coordinates[1],
      }
    : null;

  // Handle attachment downloads
  const handleDownloadAttachment = (attachment: any) => {
    const link = document.createElement('a');
    link.href = attachment.file_path;
    link.download = attachment.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Contact preferences
  const contactPreferences = [
    complaint.citizen_phone && { type: 'Phone', value: complaint.citizen_phone, icon: Phone },
    complaint.citizen_email && { type: 'Email', value: complaint.citizen_email, icon: Mail },
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="attachments">
            Attachments ({complaint.attachment_count || 0})
          </TabsTrigger>
          {contactPreferences.length > 0 && (
            <TabsTrigger value="contact">Contact</TabsTrigger>
          )}
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Complaint Details</CardTitle>
              <CardDescription>
                Full description and additional information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Description */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Description</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="gap-2"
                  >
                    {showFullDescription ? (
                      <>
                        <EyeOff className="h-4 w-4" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        Show More
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="prose prose-slate max-w-none">
                  <p className={`text-slate-700 whitespace-pre-line ${
                    !showFullDescription && 'line-clamp-4'
                  }`}>
                    {complaint.description}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Additional Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Source */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">Submission Source</span>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {complaint.source.replace('_', ' ')}
                    </Badge>
                  </div>

                  {/* Anonymity */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Shield className="h-4 w-4" />
                      <span className="font-medium">Privacy</span>
                    </div>
                    <Badge variant={complaint.is_anonymous ? 'secondary' : 'outline'}>
                      {complaint.is_anonymous ? 'Anonymous Submission' : 'Public Submission'}
                    </Badge>
                  </div>
                </div>

                {/* Priority (if shown to citizen) */}
                {showPriority && complaint.priority && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="font-medium">Priority Level</span>
                      </div>
                      <div className="text-sm text-slate-700">
                        This complaint has been marked as <strong className="capitalize">{complaint.priority}</strong> priority.
                        {complaint.priority === 'high' || complaint.priority === 'urgent' || complaint.priority === 'critical' ? (
                          <span className="block mt-1 text-amber-600">
                            High priority complaints receive expedited review and response.
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location Tab */}
        <TabsContent value="location">
          <Card>
            <CardHeader>
              <CardTitle>Location Details</CardTitle>
              <CardDescription>
                Exact location and ward information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Map */}
              {coordinates && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Location on Map</h3>
                  <MiniMap
                    coordinates={coordinates}
                    height="300px"
                    interactive={true}
                    showMarker={true}
                  />
                  <div className="text-sm text-slate-600 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}</span>
                  </div>
                </div>
              )}

              <Separator />

              {/* Address Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Address Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Ward Information */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">Ward Details</span>
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium">
                        Ward {complaint.ward?.ward_number || 'N/A'} - {complaint.ward?.name || 'N/A'}
                      </div>
                      {complaint.ward?.chairperson_name && (
                        <div className="text-sm text-slate-600">
                          Chairperson: {complaint.ward.chairperson_name}
                        </div>
                      )}
                      {complaint.ward?.contact_phone && (
                        <div className="text-sm text-slate-600">
                          Contact: {complaint.ward.contact_phone}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">Exact Address</span>
                    </div>
                    <div className="space-y-2">
                      {complaint.address_text ? (
                        <div className="text-slate-700">
                          {complaint.address_text}
                        </div>
                      ) : (
                        <div className="text-slate-500 italic">
                          No specific address provided
                        </div>
                      )}
                      
                      {complaint.landmark && (
                        <div className="text-sm text-slate-600">
                          <span className="font-medium">Landmark:</span> {complaint.landmark}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attachments Tab */}
        <TabsContent value="attachments">
          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
              <CardDescription>
                Files and images related to this complaint
              </CardDescription>
            </CardHeader>
            <CardContent>
              {complaint.attachments && complaint.attachments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {complaint.attachments.map((attachment) => {
                    const isImage = attachment.file_type?.startsWith('image/');
                    
                    return (
                      <div
                        key={attachment.id}
                        className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        {isImage ? (
                          <div className="aspect-video overflow-hidden bg-slate-100">
                            <img
                              src={attachment.file_path}
                              alt={attachment.file_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="aspect-video bg-slate-50 flex items-center justify-center">
                            <FileText className="h-12 w-12 text-slate-400" />
                          </div>
                        )}
                        
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate" title={attachment.file_name}>
                                {attachment.file_name}
                              </div>
                              {attachment.file_size && (
                                <div className="text-xs text-slate-500 mt-1">
                                  {(attachment.file_size / 1024).toFixed(1)} KB
                                </div>
                              )}
                            </div>
                            
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => window.open(attachment.file_path, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleDownloadAttachment(attachment)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="text-xs text-slate-500 mt-2">
                            Uploaded {new Date(attachment.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <Image className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No attachments
                  </h3>
                  <p className="text-slate-600 max-w-md mx-auto">
                    No files or images have been uploaded for this complaint.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        {contactPreferences.length > 0 && (
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Your contact details for this complaint
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Contact Details</h3>
                    {!complaint.is_anonymous && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowContactDetails(!showContactDetails)}
                        className="gap-2"
                      >
                        {showContactDetails ? (
                          <>
                            <EyeOff className="h-4 w-4" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" />
                            Show Details
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {showContactDetails ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {contactPreferences.map((contact, index) => {
                          const Icon = contact.icon;
                          return (
                            <div key={index} className="space-y-3">
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Icon className="h-4 w-4" />
                                <span className="font-medium">{contact.type}</span>
                              </div>
                              <div className="text-slate-900 font-medium">
                                {contact.value}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <h4 className="text-sm font-medium text-blue-800">
                              Contact Preferences
                            </h4>
                            <p className="text-sm text-blue-700">
                              Updates about your complaint will be sent to the contact methods above.
                              You can update your preferences in your account settings.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                        <Shield className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        Contact Information Hidden
                      </h3>
                      <p className="text-slate-600 max-w-md mx-auto">
                        Your contact details are protected. Click "Show Details" to view them.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

// MiniMap Component
function MiniMapComponent({ 
  coordinates, 
  height = '200px',
  interactive = false,
  showMarker = true 
}: { 
  coordinates: { lat: number; lng: number };
  height?: string;
  interactive?: boolean;
  showMarker?: boolean;
}) {
  return (
    <div className="rounded-lg overflow-hidden border border-slate-200" style={{ height }}>
      <div className="w-full h-full bg-slate-100 flex items-center justify-center">
        <div className="text-center text-slate-500">
          <MapPin className="h-8 w-8 mx-auto mb-2" />
          <div className="text-sm">Map view would be displayed here</div>
          <div className="text-xs mt-1">
            Lat: {coordinates.lat.toFixed(6)}, Lng: {coordinates.lng.toFixed(6)}
          </div>
        </div>
      </div>
    </div>
  );
}