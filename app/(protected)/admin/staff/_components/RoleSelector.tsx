"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Shield } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Role {
  id: string;
  name: string;
  role_type: string;
  description: string;
  permissions: Record<string, boolean>;
}

export function RoleSelector({ roles }: { roles: Role[] }) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(roles[0] || null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
       {/* Role List */}
       <Card className="md:col-span-1 border-r-0 rounded-r-none h-full">
          <CardHeader>
             <CardTitle>System Roles</CardTitle>
             <CardDescription>Select a role to view permissions</CardDescription>
          </CardHeader>
          <ScrollArea className="h-[500px]">
             <div className="p-4 space-y-2">
                {roles.map((role) => (
                   <div 
                      key={role.id}
                      onClick={() => setSelectedRole(role)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                         selectedRole?.id === role.id 
                           ? 'bg-blue-50 border-blue-200 shadow-sm' 
                           : 'bg-white border-transparent hover:bg-gray-50'
                      }`}
                   >
                      <div className="flex items-center justify-between">
                         <span className="font-medium text-sm">{role.name}</span>
                         {selectedRole?.id === role.id && <Check className="w-4 h-4 text-blue-600" />}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{role.description}</p>
                   </div>
                ))}
             </div>
          </ScrollArea>
       </Card>

       {/* Permission Matrix */}
       <Card className="md:col-span-2 border-l-0 rounded-l-none h-full">
          <CardHeader className="bg-slate-50 border-b">
             <div className="flex justify-between items-center">
                <div>
                   <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-purple-600" />
                      {selectedRole?.name} Permissions
                   </CardTitle>
                   <CardDescription className="mt-1">{selectedRole?.description}</CardDescription>
                </div>
                <Badge variant="outline" className="uppercase font-mono">{selectedRole?.role_type}</Badge>
             </div>
          </CardHeader>
          <CardContent className="p-6">
             {selectedRole && (
                <div className="grid grid-cols-2 gap-4">
                   {selectedRole.permissions && Object.entries(selectedRole.permissions).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-3 p-3 border rounded-lg bg-white">
                         <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-red-300'}`} />
                         <div className="flex-1">
                            <span className="text-sm font-medium text-gray-700 block capitalize">
                               {key.replace(/_/g, ' ').replace('can ', '')}
                            </span>
                         </div>
                         <Badge variant={value ? "default" : "secondary"} className="text-[10px]">
                            {value ? "Allowed" : "Denied"}
                         </Badge>
                      </div>
                   ))}
                   {(!selectedRole.permissions || Object.keys(selectedRole.permissions).length === 0) && (
                      <p className="col-span-2 text-center text-gray-400 py-10">No specific permissions defined for this role.</p>
                   )}
                </div>
             )}
          </CardContent>
       </Card>
    </div>
  );
}