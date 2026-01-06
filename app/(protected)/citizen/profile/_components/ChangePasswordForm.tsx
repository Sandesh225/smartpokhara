"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Loader2,
  KeyRound,
  Check,
  AlertCircle,
  ShieldCheck,
  Lock,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const passwordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ChangePasswordForm() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const newPassword = watch("password", "");

  const onSubmit = async (data: PasswordFormData) => {
    setIsUpdating(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    setIsUpdating(false);

    if (error) {
      setErrorMsg(error.message);
      toast.error("Security Update Failed", { description: error.message });
    } else {
      toast.success("Password Updated", {
        description: "Your account security has been strengthened.",
        icon: <ShieldCheck className="h-4 w-4 text-[rgb(95,158,160)]" />,
      });
      reset();
    }
  };

  return (
    <Card className="border-0 elevation-3 rounded-3xl bg-white ring-1 ring-slate-900/5 overflow-hidden">
      <CardHeader className="card-padding bg-[rgb(244,245,247)]/50 border-b-2 border-slate-100">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[rgb(43,95,117)] to-[rgb(95,158,160)] flex items-center justify-center text-white elevation-2">
            <Lock className="h-7 w-7" />
          </div>
          <div>
            <CardTitle className="text-2xl font-black tracking-tight text-[rgb(26,32,44)]">
              Security Credentials
            </CardTitle>
            <CardDescription className="font-medium text-[rgb(26,32,44)]/60 mt-1">
              Update your password to maintain account integrity.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="card-padding space-y-8">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert variant="destructive" className="rounded-2xl border-2">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="font-bold">Update Blocked</AlertTitle>
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          <div className="grid gap-8">
            <div className="space-y-3">
              <Label
                htmlFor="password"
                className="text-xs font-black uppercase tracking-[0.2em] text-[rgb(26,32,44)]/40 ml-1"
              >
                New Secure Password
              </Label>
              <div className="relative group">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(26,32,44)]/40 group-focus-within:text-[rgb(43,95,117)] transition-colors" />
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  className={cn(
                    "pl-11 h-12 rounded-2xl border-2 border-slate-200 bg-white focus:ring-4 focus:ring-[rgb(43,95,117)]/10 transition-all font-bold",
                    errors.password &&
                      "border-[rgb(229,121,63)] focus:ring-[rgb(229,121,63)]/10"
                  )}
                  placeholder="••••••••"
                />
              </div>
              <div className="flex items-center justify-between px-1">
                <p
                  className={cn(
                    "text-xs font-bold transition-colors",
                    errors.password
                      ? "text-[rgb(229,121,63)]"
                      : "text-[rgb(26,32,44)]/40"
                  )}
                >
                  {errors.password
                    ? errors.password.message
                    : "Minimum 8 characters required"}
                </p>
                {newPassword.length >= 8 && !errors.password && (
                  <span className="text-xs font-black text-[rgb(95,158,160)] uppercase flex items-center gap-1">
                    <Check className="h-3 w-3" strokeWidth={3} /> Strong
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="confirmPassword"
                className="text-xs font-black uppercase tracking-[0.2em] text-[rgb(26,32,44)]/40 ml-1"
              >
                Verify New Password
              </Label>
              <div className="relative group">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(26,32,44)]/40 group-focus-within:text-[rgb(43,95,117)] transition-colors" />
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  className={cn(
                    "pl-11 h-12 rounded-2xl border-2 border-slate-200 bg-white focus:ring-4 focus:ring-[rgb(43,95,117)]/10 transition-all font-bold",
                    errors.confirmPassword &&
                      "border-[rgb(229,121,63)] focus:ring-[rgb(229,121,63)]/10"
                  )}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs font-bold text-[rgb(229,121,63)] ml-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-[rgb(244,245,247)]/50 border-t-2 border-slate-100 card-padding flex justify-end">
          <Button
            type="submit"
            disabled={isUpdating}
            className="w-full sm:w-auto min-w-[180px] h-12 rounded-2xl bg-[rgb(43,95,117)] hover:bg-[rgb(43,95,117)]/90 font-black text-white elevation-2 transition-all active:scale-95"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              <>
                Commit Changes
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
