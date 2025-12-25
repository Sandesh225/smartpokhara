import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* Left Side - Form Section */}
      <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96 space-y-8">
          {/* Header & Logo */}
          <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-500">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[rgb(43,95,117)] transition-colors mb-6 group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>

            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[rgb(43,95,117)] to-[rgb(95,158,160)] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[rgb(43,95,117)]/20 mb-6">
              SP
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-[rgb(26,32,44)]">
              Welcome back
            </h2>
            <p className="text-slate-500 text-sm">
              Please enter your details to sign in to the citizen portal.
            </p>
          </div>

          {/* Form Component */}
          <LoginForm />

          {/* Footer */}
          <div className="text-center text-xs text-slate-400 mt-8">
            <p>
              By signing in, you agree to our{" "}
              <Link
                href="/terms"
                className="underline hover:text-[rgb(43,95,117)]"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline hover:text-[rgb(43,95,117)]"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image Section with Glass effect */}
      <div className="relative hidden lg:block flex-1">
        <div className="absolute inset-0 h-full w-full bg-[rgb(26,32,44)]">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90 transition-transform hover:scale-105 duration-[20s]"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2071')`,
            }}
          />
          {/* Gradient Overlay - Phewa Blue */}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgb(43,95,117)]/90 via-[rgb(43,95,117)]/40 to-transparent" />
        </div>

        {/* Floating Content with Glass effect */}
        <div className="absolute bottom-0 left-0 right-0 p-20 text-white z-10">
          <div className="max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-md bg-white/10 border border-white/20">
              <span className="flex h-2 w-2 rounded-full bg-[rgb(95,158,160)] animate-pulse" />
              <span className="text-xs font-medium tracking-wide uppercase">
                Smart City Initiative
              </span>
            </div>
            <blockquote className="text-2xl font-medium leading-relaxed">
              "Building a digital future for Pokhara. Access municipal services,
              track applications, and connect with your city securely."
            </blockquote>
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full border-2 border-[rgb(43,95,117)] bg-slate-200"
                    style={{
                      backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 10})`,
                      backgroundSize: "cover",
                    }}
                  />
                ))}
              </div>
              <div className="text-sm font-medium text-[rgb(95,158,160)] font-mono tabular-nums">
                Trusted by 50k+ Citizens
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
