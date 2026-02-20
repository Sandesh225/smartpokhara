import React from "react";
import { Shield, Lock, Eye, FileText } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Smart Pokhara",
  description: "Learn how Smart Pokhara collects, uses, and protects your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your privacy is our priority. We are committed to protecting your personal information while you use our digital services.
          </p>
          <p className="text-sm text-muted-foreground/80">
            Last Updated: February 20, 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold m-0">Information We Collect</h2>
            </div>
            <p>
              When you use the Smart Pokhara portal, we may collect the following types of information:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Personal Identification:</strong> Name, address, email, phone number, and citizenship details used for verification.</li>
              <li><strong>Service Data:</strong> Details about complaints, applications, and payments you submit.</li>
              <li><strong>Technical Data:</strong> IP address, browser type, and device information to ensure system security and performance.</li>
            </ul>
          </section>

          <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-secondary" />
              <h2 className="text-2xl font-bold m-0">How We Use Your Data</h2>
            </div>
            <p>
              We use the collected information strictly for municipal purposes, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Processing your service requests, applications, and payments.</li>
              <li>Verifying your identity as a resident of Pokhara Metropolitan City.</li>
              <li>Communicating with you regarding the status of your requests.</li>
              <li>Improving our digital services and infrastructure based on usage patterns.</li>
            </ul>
          </section>

          <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-accent-nature" />
              <h2 className="text-2xl font-bold m-0">Data Security</h2>
            </div>
            <p>
              We implement industry-standard security measures to protect your data from unauthorized access, alteration, or disclosure. Your sensitive information is encrypted during transmission and storage.
            </p>
            <p className="mt-4">
              We do not sell your personal data to third parties. Data is only shared with relevant municipal departments or legal authorities when required by law.
            </p>
          </section>

          <section>
             <h2 className="text-2xl font-bold text-foreground">Contact Us</h2>
             <p className="text-muted-foreground mt-2">
                If you have any questions about this Privacy Policy, please contact our Data Protection Officer at <a href="mailto:privacy@pokharamun.gov.np" className="text-primary hover:underline">privacy@pokharamun.gov.np</a>.
             </p>
          </section>
        </div>
      </div>
    </div>
  );
}
