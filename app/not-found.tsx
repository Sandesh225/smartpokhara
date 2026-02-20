"use client";

import Link from "next/link";
import { ArrowLeft, Home, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4 animate-in fade-in duration-500">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="relative flex items-center justify-center w-32 h-32 rounded-3xl bg-card border-2 border-border shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
          <FileQuestion className="w-16 h-16 text-primary" />
        </div>
      </div>

      <div className="text-center space-y-4 max-w-md mx-auto">
        <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
          Page Not Found
        </h1>
        <p className="text-lg text-muted-foreground font-medium">
          The page you are looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            variant="default"
            size="lg"
            asChild
            className="w-full sm:w-auto font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-105 transition-all"
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            asChild
            className="w-full sm:w-auto font-bold border-2 hover:bg-accent hover:text-accent-foreground transition-all"
          >
            <Link href="#" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground/60 font-semibold">
          Error Code: 404
        </p>
      </div>
    </div>
  );
}
