import React from "react";
import { Database, Server, UserCheck, HardDrive } from "lucide-react";

export const metadata = {
  title: "Data Protection | Smart Pokhara",
  description: "Information about how we store and process your data.",
};

export default function DataProtectionPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-purple-500/10 rounded-full mb-4">
            <Database className="w-10 h-10 text-purple-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
            Data Protection
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our comprehensive approach to securing municipal data and personal records.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
           <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-foreground mb-4">Data Governance</h2>
            <p>
              Smart Pokhara adheres to the strict data governance policies mandated by the Government of Nepal. All data collected is treated as confidential municipal records.
            </p>
          </section>

          <section className="grid md:grid-cols-2 gap-6">
             <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                 <div className="flex items-center gap-3 mb-3">
                     <Server className="w-6 h-6 text-primary" />
                     <h3 className="text-xl font-bold">Storage & Retention</h3>
                 </div>
                 <p className="text-muted-foreground text-sm">
                     Data is stored in secure, redundant government-approved data centers using industry-standard encryption at rest. We retain records only for as long as required by municipal laws.
                 </p>
             </div>
             <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                 <div className="flex items-center gap-3 mb-3">
                     <UserCheck className="w-6 h-6 text-secondary" />
                     <h3 className="text-xl font-bold">Access Control</h3>
                 </div>
                 <p className="text-muted-foreground text-sm">
                     Access to personal data is strictly limited to authorized municipal staff with role-based permissions. Every data access is logged and audited.
                 </p>
             </div>
          </section>
          
           <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <HardDrive className="w-6 h-6 text-accent-nature" />
              <h2 className="text-2xl font-bold m-0">Your Rights</h2>
            </div>
            <p>
              As a citizen, you have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Request access to the personal data we hold about you.</li>
              <li>Request correction of inaccurate or incomplete data.</li>
              <li>Request deletion of data that is no longer necessary for municipal purposes (subject to record-keeping laws).</li>
              <li>Object to the processing of your data for specific non-essential purposes.</li>
            </ul>
             <p className="mt-4 text-sm text-muted-foreground">
                 To exercise these rights, please submit a formal request through your citizen dashboard or visit the Ward Office.
             </p>
          </section>

        </div>
      </div>
    </div>
  );
}
