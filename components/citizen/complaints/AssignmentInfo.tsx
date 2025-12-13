// components/citizen/complaints/AssignmentInfo.tsx
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Progress } from '@/ui//progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/ui//alert-dialog';
import {
  Mail,
  Phone,
  Clock,
  User,
  Building,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  ChevronRight,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import { complaintsService } from '@/lib/supabase/queries/complaints';
import type { Complaint } from '@/lib/supabase/queries/complaints';

interface AssignmentInfoProps {
  complaint: Complaint;
  onContact?: () => void;
}

export function AssignmentInfo({ complaint, onContact }: AssignmentInfoProps) {
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [slaProgress, setSlaProgress] = useState(0);
  const [isOverdue, setIsOverdue] = useState(false);
  const [overdueDays, setOverdueDays] = useState(0);
  const [assignedStaff, setAssignedStaff] = useState<any>(null);
  const [assignedDepartment, setAssignedDepartment] = useState<any>(null);

  // Calculate SLA progress
  useEffect(() => {
    if (!complaint.sla_due_at) return;

    const now = new Date();
    const dueDate = new Date(complaint.sla_due_at);
    const submittedDate = new Date(complaint.submitted_at);
    
    const totalSlaTime = dueDate.getTime() - submittedDate.getTime();
    const timeElapsed = now.getTime() - submittedDate.getTime();
    
    let progress = (timeElapsed / totalSlaTime) * 100;
    progress = Math.min(Math.max(progress, 0), 100);
    
    setSlaProgress(progress);
    setIsOverdue(now > dueDate);
    
    if (now > dueDate) {
      const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      setOverdueDays(daysOverdue);
    }
  }, [complaint]);

  // Load staff and department details
  useEffect(() => {
    const loadAssignmentDetails = async () => {
      try {
        if (complaint.assigned_staff_id) {
          // In a real implementation, you would fetch staff details here
          // For now, we'll use mock data
          setAssignedStaff({
            id: complaint.assigned_staff_id,
            name: 'John Doe',
            role: 'Field Officer',
            email: 'john.doe@municipality.gov',
            phone: '+977 9841234567',
            avatar: '/avatars/staff/john-doe.jpg',
            department: 'Public Works',
          });
        }
        
        if (complaint.assigned_department_id) {
          // In a real implementation, you would fetch department details here
          // For now, we'll use mock data
          setAssignedDepartment({
            id: complaint.assigned_department_id,
            name: 'Public Works Department',
            code: 'PWD',
            head: 'Ram Bahadur',
            contact_email: 'pwd@municipality.gov',
            contact_phone: '+977 1 4234567',
            office_hours: '9:00 AM - 5:00 PM, Mon-Fri',
            address: 'Municipality Building, Room 205',
          });
        }
      } catch (error) {
        console.error('Error loading assignment details:', error);
      }
    };

    loadAssignmentDetails();
  }, [complaint]);

  // Calculate expected resolution time
  const calculateExpectedResolution = () => {
    if (!complaint.sla_due_at) return null;
    
    const dueDate = new Date(complaint.sla_due_at);
    const now = new Date();
    
    if (now > dueDate) {
      return { text: 'Overdue', variant: 'destructive' as const };
    }
    
    const daysLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft === 0) {
      return { text: 'Due today', variant: 'destructive' as const };
    } else if (daysLeft <= 2) {
      return { text: `${daysLeft} days left`, variant: 'destructive' as const };
    } else if (daysLeft <= 5) {
      return { text: `${daysLeft} days left`, variant: 'outline' as const };
    } else {
      return { text: `${daysLeft} days left`, variant: 'default' as const };
    }
  };

  const expectedResolution = calculateExpectedResolution();

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5 text-slate-500" />
          Assignment & SLA
        </CardTitle>
        <CardDescription>
          Who is handling your complaint and expected timeline
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Department Assignment */}
        {assignedDepartment && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-slate-500" />
                <span className="font-medium text-slate-700">Assigned Department</span>
              </div>
              <Badge variant="outline" className="gap-1">
                {assignedDepartment.code}
              </Badge>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-900">
                  {assignedDepartment.name}
                </h4>
                
                <div className="space-y-2">
                  {assignedDepartment.head && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-800">
                        Head: <span className="font-medium">{assignedDepartment.head}</span>
                      </span>
                    </div>
                  )}
                  
                  {assignedDepartment.contact_phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-800">{assignedDepartment.contact_phone}</span>
                    </div>
                  )}
                  
                  {assignedDepartment.contact_email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-800">{assignedDepartment.contact_email}</span>
                    </div>
                  )}
                  
                  {assignedDepartment.office_hours && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-800">{assignedDepartment.office_hours}</span>
                    </div>
                  )}
                  
                  {assignedDepartment.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-800">{assignedDepartment.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Staff Assignment */}
        {assignedStaff && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-500" />
                <span className="font-medium text-slate-700">Assigned Staff</span>
              </div>
              <Badge variant="secondary">{assignedStaff.role}</Badge>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <Avatar className="h-12 w-12">
                <AvatarImage src={assignedStaff.avatar} />
                <AvatarFallback>
                  {assignedStaff.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900">{assignedStaff.name}</h4>
                <p className="text-sm text-slate-600">{assignedStaff.department}</p>
                
                <div className="flex items-center gap-4 mt-2">
                  {assignedStaff.email && (
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Mail className="h-3 w-3" />
                      <span>{assignedStaff.email}</span>
                    </div>
                  )}
                  
                  {assignedStaff.phone && (
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Phone className="h-3 w-3" />
                      <span>{assignedStaff.phone}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {onContact && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsContactDialogOpen(true)}
                  className="gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Contact
                </Button>
              )}
            </div>
          </div>
        )}

        {/* No Assignment Yet */}
        {!assignedDepartment && !assignedStaff && (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Awaiting Assignment
            </h3>
            <p className="text-slate-600 max-w-md mx-auto mb-6">
              Your complaint is in queue to be assigned to a department. 
              This usually happens within 24 hours of submission.
            </p>
            <Badge variant="outline">In Assignment Queue</Badge>
          </div>
        )}

        {/* SLA Progress */}
        {complaint.sla_due_at && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span className="font-medium text-slate-700">SLA Timeline</span>
              </div>
              {expectedResolution && (
                <Badge variant={expectedResolution.variant}>
                  {expectedResolution.text}
                </Badge>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Submitted</span>
                <span className="text-slate-600">Due Date</span>
              </div>
              
              <Progress 
                value={slaProgress} 
                className={`h-2 ${isOverdue ? 'bg-red-100' : 'bg-slate-100'}`}
              />
              
              <div className="flex justify-between text-sm">
                <span className="font-medium">
                  {format(new Date(complaint.submitted_at), 'MMM dd')}
                </span>
                <span className="font-medium">
                  {format(new Date(complaint.sla_due_at), 'MMM dd')}
                </span>
              </div>
              
              {/* SLA Status */}
              <div className={`p-3 rounded-lg ${
                isOverdue 
                  ? 'bg-red-50 border border-red-200' 
                  : slaProgress > 75 
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-green-50 border border-green-200'
              }`}>
                <div className="flex items-center gap-2">
                  {isOverdue ? (
                    <>
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium text-red-800">
                          Overdue by {overdueDays} day{overdueDays !== 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-red-700">
                          The department has been notified about the delay
                        </p>
                      </div>
                    </>
                  ) : slaProgress > 75 ? (
                    <>
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="font-medium text-amber-800">
                          Approaching deadline
                        </p>
                        <p className="text-sm text-amber-700">
                          Complaint is being handled with priority
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">
                          On track for resolution
                        </p>
                        <p className="text-sm text-green-700">
                          Complaint is progressing as expected
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Estimated resolution notes */}
              <div className="text-sm text-slate-600">
                <p>
                  {isOverdue 
                    ? 'The department is working to resolve this issue as soon as possible.' 
                    : 'Expected resolution within the SLA timeframe.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Ward Contact Info */}
        {complaint.ward && (
          <div className="pt-4 border-t border-slate-200">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-500" />
                <span className="font-medium text-slate-700">Ward Office Contact</span>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-900">
                    Ward {complaint.ward.ward_number} - {complaint.ward.name}
                  </h4>
                  
                  {complaint.ward.chairperson_name && (
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <User className="h-4 w-4" />
                      <span>Chairperson: {complaint.ward.chairperson_name}</span>
                    </div>
                  )}
                  
                  {complaint.ward.contact_phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Phone className="h-4 w-4" />
                      <span>{complaint.ward.contact_phone}</span>
                    </div>
                  )}
                  
                  {complaint.ward.contact_email && (
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Mail className="h-4 w-4" />
                      <span>{complaint.ward.contact_email}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between"
                onClick={() => window.open(`/wards/${complaint.ward_id}`, '_blank')}
              >
                <span>View ward details</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Contact Dialog */}
      <AlertDialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Contact Assigned Staff</AlertDialogTitle>
            <AlertDialogDescription>
              You can contact {assignedStaff?.name} through the following methods:
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            {assignedStaff?.email && (
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-slate-600" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-slate-600">{assignedStaff.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = `mailto:${assignedStaff.email}`}
                >
                  Send Email
                </Button>
              </div>
            )}
            
            {assignedStaff?.phone && (
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-slate-600" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-slate-600">{assignedStaff.phone}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = `tel:${assignedStaff.phone}`}
                >
                  Call Now
                </Button>
              </div>
            )}
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}