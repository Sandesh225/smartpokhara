import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ArrowLeft, Landmark } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-background dark:bg-background">
      {/* Left Side - Form Section */}
      <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 bg-background dark:bg-background">
        <div className="mx-auto w-full max-w-sm lg:w-96 space-y-8">
          {/* Header & Logo */}
          <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground/90 hover:text-primary dark:hover:text-primary/90 transition-colors group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </Link>
              <ThemeToggle />
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground dark:text-foreground/95 mb-2">
                Create Account
              </h2>
              <p className="text-muted-foreground dark:text-muted-foreground/90 text-sm sm:text-base leading-relaxed">
                Join the digital network to access municipal services and engage
                with your city.
              </p>
            </div>
          </div>

          {/* Form Component */}
          <RegisterForm />

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground dark:text-muted-foreground/80 mt-8 leading-relaxed border-t border-border dark:border-border/50 pt-6">
            <p>
              By registering, you agree to our{" "}
              <Link
                href="/terms"
                className="underline hover:text-primary dark:hover:text-primary/90 transition-colors font-medium"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline hover:text-primary dark:hover:text-primary/90 transition-colors font-medium"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image Section */}
      <div className="relative hidden lg:block overflow-hidden">
        {/* Background Image Container */}
        <div className="absolute inset-0 h-full w-full bg-slate-700 dark:bg-card">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 dark:opacity-40 transition-all duration-500 hover:scale-105"
            style={{
              backgroundImage: `url('/paragliding.jpg')`,
            }}
          />
          {/* Gradient Overlay - Better in new color scheme */}
          <div className="absolute inset-0 bg-linear-to-br from-primary/80 via-secondary/50 to-transparent dark:from-card/95 dark:via-secondary/40 dark:to-transparent" />
        </div>

        {/* Floating Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-16 text-white z-10">
          <div className="max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md bg-white/10 dark:bg-white/20 border border-white/20 dark:border-white/30 shadow-lg">
              <span className="flex h-2 w-2 rounded-full bg-secondary dark:bg-secondary/90 animate-pulse shadow-lg shadow-secondary/50" />
              <span className="text-xs font-semibold tracking-wide uppercase">
                Secure Government Portal
              </span>
            </div>

            {/* Quote */}
            <blockquote className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-white drop-shadow-lg">
              "A transparent and connected future for every citizen."
            </blockquote>
            <p className="text-base md:text-lg text-white/90 dark:text-white/80 leading-relaxed">
              Join thousands of citizens already using our platform to make
              their city better.
            </p>

            {/* Trust Indicators */}
            <div className="flex items-center gap-4 pt-4 flex-wrap">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full border-2 border-white/30 dark:border-white/50 bg-slate-300 shadow-lg"
                    style={{
                      backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 10})`,
                      backgroundSize: "cover",
                    }}
                  />
                ))}
              </div>
              <div className="text-sm font-bold text-white">
                Join{" "}
                <span className="text-secondary dark:text-secondary/90">
                  250k+
                </span>{" "}
                Citizens
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-secondary/20 dark:bg-secondary/10 blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/3 left-10 w-40 h-40 rounded-full bg-primary/20 dark:bg-primary/10 blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>
    </div>
  );
}