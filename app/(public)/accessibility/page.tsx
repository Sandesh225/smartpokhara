import React from "react";
import { Accessibility, MonitorSmartphone, Ear, Keyboard } from "lucide-react";

export const metadata = {
  title: "Accessibility | Smart Pokhara",
  description: "Our commitment to digital accessibility for all citizens.",
};

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-success-green/10 rounded-full mb-4">
            <Accessibility className="w-10 h-10 text-success-green" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
            Accessibility Statement
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Pokhara Metropolitan City is committed to ensuring digital accessibility for people with disabilities.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-foreground mb-4">Conformance Status</h2>
            <p>
              The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA.
            </p>
            <p className="mt-4 font-medium text-primary">
              The Smart Pokhara portal is partially conformant with WCAG 2.1 level AA. Partially conformant means that some parts of the content do not fully conform to the accessibility standard, but we are actively working to address these gaps.
            </p>
          </section>

          <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-foreground mb-6">Accessibility Features</h2>
             <div className="grid sm:grid-cols-2 gap-6">
                 <div className="flex gap-4">
                    <div className="mt-1 bg-muted p-2 rounded-lg h-fit">
                        <MonitorSmartphone className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Responsive Design</h3>
                        <p className="text-sm text-muted-foreground">Our site automatically adapts to different screen sizes, from mobile phones to desktops.</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                     <div className="mt-1 bg-muted p-2 rounded-lg h-fit">
                        <Keyboard className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Keyboard Navigation</h3>
                        <p className="text-sm text-muted-foreground">We strive to ensure all interactive elements are reachable and usable via keyboard.</p>
                    </div>
                 </div>
                  <div className="flex gap-4">
                     <div className="mt-1 bg-muted p-2 rounded-lg h-fit">
                        <Ear className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Screen Reader Support</h3>
                        <p className="text-sm text-muted-foreground">We use semantic HTML and ARIA labels to support screen reader technologies.</p>
                    </div>
                 </div>
             </div>
          </section>

          <section>
             <h2 className="text-2xl font-bold text-foreground">Feedback</h2>
             <p className="text-muted-foreground mt-2">
                We welcome your feedback on the accessibility of the Smart Pokhara portal. Please let us know if you encounter accessibility barriers:
             </p>
             <ul className="list-none pl-0 mt-4 space-y-2">
                <li><strong>Phone:</strong> +977-61-521105</li>
                <li><strong>E-mail:</strong> <a href="mailto:access@pokharamun.gov.np" className="text-primary hover:underline">access@pokharamun.gov.np</a></li>
                <li><strong>Address:</strong> New Road, Pokhara-8, Kaski, Nepal</li>
             </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
