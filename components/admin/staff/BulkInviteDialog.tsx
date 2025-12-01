// components/admin/staff/BulkInviteDialog.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Upload, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import Papa from "papaparse";

interface BulkInviteDialogProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface CSVRow {
  full_name: string;
  email: string;
  phone?: string;
  role_type: string;
  department_id?: string;
  ward_id?: string;
}

interface InvitationResult {
  row: number;
  email: string;
  full_name: string;
  status: "success" | "error";
  message?: string;
}

export function BulkInviteDialog({ onClose, onSuccess }: BulkInviteDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<InvitationResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const downloadTemplate = () => {
    const template = `full_name,email,phone,role_type,department_id,ward_id
John Doe,john@example.com,+977-9841234567,dept_staff,,
Jane Smith,jane@example.com,+977-9847654321,ward_staff,,ward-uuid-here
Bob Wilson,bob@example.com,,field_staff,,`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "staff_invitation_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setResults([]);
      setShowResults(false);
    } else {
      alert("Please select a valid CSV file");
    }
  };

  const processInvitations = async () => {
    if (!file) return;

    setProcessing(true);
    setResults([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (parseResult) => {
        const rows = parseResult.data as CSVRow[];
        const invitationResults: InvitationResult[] = [];
        const supabase = createClient();

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const rowNumber = i + 2; // +2 for header and 0-index

          try {
            // Validate required fields
            if (!row.email || !row.full_name || !row.role_type) {
              invitationResults.push({
                row: rowNumber,
                email: row.email || "N/A",
                full_name: row.full_name || "N/A",
                status: "error",
                message: "Missing required fields (email, full_name, or role_type)",
              });
              continue;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(row.email)) {
              invitationResults.push({
                row: rowNumber,
                email: row.email,
                full_name: row.full_name,
                status: "error",
                message: "Invalid email format",
              });
              continue;
            }

            // Validate role type
            const validRoles = ["admin", "dept_head", "dept_staff", "ward_staff", "field_staff", "call_center"];
            if (!validRoles.includes(row.role_type)) {
              invitationResults.push({
                row: rowNumber,
                email: row.email,
                full_name: row.full_name,
                status: "error",
                message: `Invalid role type. Must be one of: ${validRoles.join(", ")}`,
              });
              continue;
            }

            // Send invitation
            const { data, error } = await supabase.rpc("invite_staff_member", {
              p_email: row.email.trim(),
              p_full_name: row.full_name.trim(),
              p_phone: row.phone?.trim() || null,
              p_role_type: row.role_type.trim() as any,
              p_department_id: row.department_id?.trim() || null,
              p_ward_id: row.ward_id?.trim() || null,
            });

            if (error) {
              invitationResults.push({
                row: rowNumber,
                email: row.email,
                full_name: row.full_name,
                status: "error",
                message: error.message,
              });
            } else {
              invitationResults.push({
                row: rowNumber,
                email: row.email,
                full_name: row.full_name,
                status: "success",
                message: "Invitation sent successfully",
              });

              // TODO: Send email notification
              // await EmailService.sendInvitation({
              //   recipientEmail: row.email,
              //   recipientName: row.full_name,
              //   inviterName: currentUser.name,
              //   role: row.role_type,
              //   invitationLink: data.invitation_link,
              //   expiresAt: new Date(data.expires_at),
              // });
            }
          } catch (err: any) {
            invitationResults.push({
              row: rowNumber,
              email: row.email || "N/A",
              full_name: row.full_name || "N/A",
              status: "error",
              message: err.message || "Unexpected error",
            });
          }

          // Small delay to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        setResults(invitationResults);
        setShowResults(true);
        setProcessing(false);
      },
      error: (error) => {
        console.error("CSV parsing error:", error);
        alert("Failed to parse CSV file. Please check the format.");
        setProcessing(false);
      },
    });
  };

  const successCount = results.filter(r => r.status === "success").length;
  const errorCount = results.filter(r => r.status === "error").length;

  if (showResults) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
          
          <div className="relative w-full max-w-2xl transform overflow-hidden rounded-lg bg-white shadow-xl">
            <div className="absolute right-4 top-4">
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">
                Bulk Invitation Results
              </h3>

              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-blue-50 p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{results.length}</div>
                  <div className="text-sm text-blue-800">Total Processed</div>
                </div>
                <div className="rounded-lg bg-green-50 p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{successCount}</div>
                  <div className="text-sm text-green-800">Successful</div>
                </div>
                <div className="rounded-lg bg-red-50 p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                  <div className="text-sm text-red-800">Failed</div>
                </div>
              </div>

              <div className="mt-6 max-h-96 overflow-y-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Row</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {results.map((result, idx) => (
                      <tr key={idx} className={result.status === "error" ? "bg-red-50" : ""}>
                        <td className="px-4 py-3 text-sm text-gray-900">{result.row}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{result.full_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{result.email}</td>
                        <td className="px-4 py-3">
                          {result.status === "success" ? (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              Success
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-sm text-red-600">
                                <XCircle className="h-4 w-4" />
                                Failed
                              </div>
                              <div className="text-xs text-red-500">{result.message}</div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={onSuccess}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white shadow-xl">
          <div className="absolute right-4 top-4">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">
              Bulk Staff Invitation
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Upload a CSV file to invite multiple staff members at once
            </p>

            <div className="mt-6 space-y-4">
              {/* Download Template */}
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-6">
                <div className="text-center">
                  <Download className="mx-auto h-12 w-12 text-gray-400" />
                  <h4 className="mt-2 text-sm font-medium text-gray-900">
                    Step 1: Download Template
                  </h4>
                  <p className="mt-1 text-xs text-gray-500">
                    Download the CSV template and fill in staff details
                  </p>
                  <button
                    onClick={downloadTemplate}
                    className="mt-4 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Download Template
                  </button>
                </div>
              </div>

              {/* Upload File */}
              <div className="rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-blue-600" />
                  <h4 className="mt-2 text-sm font-medium text-gray-900">
                    Step 2: Upload CSV File
                  </h4>
                  <p className="mt-1 text-xs text-gray-500">
                    {file ? file.name : "No file selected"}
                  </p>
                  <label className="mt-4 inline-block cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                    {file ? "Change File" : "Select File"}
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Instructions */}
              <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">CSV Format Requirements:</p>
                    <ul className="mt-2 list-disc list-inside space-y-1">
                      <li>Required: full_name, email, role_type</li>
                      <li>Optional: phone, department_id, ward_id</li>
                      <li>Valid roles: admin, dept_head, dept_staff, ward_staff, field_staff, call_center</li>
                      <li>One staff member per row</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={processInvitations}
                disabled={!file || processing}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? "Processing..." : "Upload & Send Invitations"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}