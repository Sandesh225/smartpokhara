"use client";

import { useState } from "react";
import { UniversalCombobox } from "@/components/ui/UniversalCombobox";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Check } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Role {
  id: string;
  name: string;
  role_type: string;
  description: string;
  permissions: Record<string, boolean>;
}

export default function RolesPageClient({ roles }: { roles: Role[] }) {
  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0]?.id || "");
  
  const selectedRole = roles.find(r => r.id === selectedRoleId);

  return (
    <div className="space-y-4 md:space-y-6 px-2 sm:px-4 lg:px-6 py-4 md:py-6">
      {/* BACK BUTTON */}
      <Button variant="ghost" asChild size="sm">
        <Link href="/admin/staff">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Staff
        </Link>
      </Button>

      {/* HEADER */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tighter">
          Roles & Permissions
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of system access levels and capabilities
        </p>
      </div>

      {/* SELECTION + DETAILS */}
      <div className="grid gap-6">
          <div className="max-w-md">
             <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Select Role to Inspect</label>
             <UniversalCombobox 
                items={roles.map(r => ({ id: r.id, value: r.id, label: r.name, description: r.description }))}
                value={selectedRoleId}
                onChange={setSelectedRoleId}
                placeholder="Select a role..."
                renderItem={(item) => (
                    <div className="flex flex-col">
                        <span className="font-bold">{item.label}</span>
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                    </div>
                )}
             />
          </div>

          {selectedRole && (
            <Card>
                <CardHeader className="bg-slate-50 border-b">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-purple-600" />
                                {selectedRole.name} Permissions
                            </CardTitle>
                            <CardDescription className="mt-1">{selectedRole.description}</CardDescription>
                        </div>
                        <Badge variant="outline" className="uppercase font-mono">{selectedRole.role_type}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedRole.permissions && Object.entries(selectedRole.permissions).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-3 p-3 border rounded-lg bg-white">
                                <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-red-300'}`} />
                                <div className="flex-1">
                                    <span className="text-sm font-medium text-gray-700 block capitalize">
                                        {key.replace(/_/g, ' ').replace('can ', '')}
                                    </span>
                                </div>
                                <Badge variant={value ? "default" : "secondary"} className="text-xs">
                                    {value ? "Allowed" : "Denied"}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
}
