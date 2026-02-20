import React from "react";
import { Scale, Users, FileWarning, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Smart Pokhara",
  description: "Terms and conditions for using the Smart Pokhara digital services.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-secondary/10 rounded-full mb-4">
            <Scale className="w-10 h-10 text-secondary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Please read these terms carefully before using the Smart Pokhara portal.
          </p>
          <p className="text-sm text-muted-foreground/80">
            Last Updated: February 20, 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold m-0">Acceptance of Terms</h2>
            </div>
            <p>
              By accessing or using the Smart Pokhara digital platform, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
            </p>
          </section>

          <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <FileWarning className="w-6 h-6 text-warning-amber" />
              <h2 className="text-2xl font-bold m-0">User Responsibilities</h2>
            </div>
            <p>
              When using our services, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Provide accurate, current, and complete information during registration and application processes.</li>
              <li>Maintain the confidentiality of your account credentials.</li>
              <li>Use the platform only for lawful municipal purposes.</li>
              <li>Not interfere with or disrupt the integrity or performance of the platform.</li>
            </ul>
             <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground border border-border/50">
                <strong>Note:</strong> False reporting or misuse of the complaint system may lead to account suspension or legal action.
             </div>
          </section>

          <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-destructive" />
              <h2 className="text-2xl font-bold m-0">Limitation of Liability</h2>
            </div>
            <p>
              Pokhara Metropolitan City shall not be liable for any indirect, incidental, specific, or consequential damages resulting from the use or inability to use the service, or strictly for any delays in service delivery caused by technical issues.
            </p>
          </section>

          <section>
             <h2 className="text-2xl font-bold text-foreground">Modifications</h2>
             <p className="text-muted-foreground mt-2">
                We reserve the right to modify these terms at any time. We will notify users of any significant changes. Your continued use of the platform constitutes acceptance of the new terms.
             </p>
          </section>
        </div>
      </div>
    </div>
  );
}
