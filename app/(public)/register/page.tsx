import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-background">
      {/* Left Side - Form Section */}
      <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-background dark:bg-[rgb(15,20,25)]">
        <div className="mx-auto w-full max-w-sm lg:w-96 space-y-8">
          {/* Header & Logo */}
          <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-500">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6 group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>

            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20 dark:shadow-primary/30 mb-6 ring-2 ring-primary/10">
              SP
            </div>

            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Create Account
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Join the digital network to pay taxes, report issues, and access
              official municipal services.
            </p>
          </div>

          {/* Form Component */}
          <RegisterForm />

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground mt-8 leading-relaxed">
            <p>
              By registering, you agree to our{" "}
              <Link
                href="/terms"
                className="underline hover:text-primary transition-colors font-medium"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline hover:text-primary transition-colors font-medium"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image Section with Glass effect */}
      <div className="relative hidden lg:block">
        <div className="absolute inset-0 h-full w-full bg-[rgb(26,32,44)] dark:bg-[rgb(15,20,25)]">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80 dark:opacity-60 transition-all duration-500 hover:scale-[1.02]"
            style={{
              backgroundImage: `url('/paragliding.jpg')`,
            }}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent dark:from-[rgb(15,20,25)]/95 dark:via-primary/30" />
        </div>

        {/* Floating Content with Glass effect */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-20 text-white z-10">
          <div className="max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 shadow-lg">
              <span className="flex h-2 w-2 rounded-full bg-secondary animate-pulse shadow-lg shadow-secondary/50" />
              <span className="text-xs font-medium tracking-wide uppercase">
                Secure Government Portal
              </span>
            </div>
            <blockquote className="text-xl md:text-2xl font-medium leading-relaxed text-white/95">
              "A transparent and connected future for every citizen."
            </blockquote>
            <div className="flex items-center gap-4 pt-4 flex-wrap">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full border-2 border-primary dark:border-white/20 bg-muted shadow-md"
                    style={{
                      backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 10})`,
                      backgroundSize: "cover",
                    }}
                  />
                ))}
              </div>
              <div className="text-sm font-medium text-secondary dark:text-primary font-mono tabular-nums">
                Trusted by 50k+ Citizens
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}