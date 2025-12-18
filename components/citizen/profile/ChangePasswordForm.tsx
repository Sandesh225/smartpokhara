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
        icon: <ShieldCheck className="h-4 w-4 text-green-500" />,
      });
      reset();
    }
  };

  return (
    <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white ring-1 ring-slate-900/5 overflow-hidden">
      <CardHeader className="p-8 md:p-10 bg-slate-50/50 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-2xl font-black tracking-tight text-slate-900">
              Security Credentials
            </CardTitle>
            <CardDescription className="font-medium text-slate-500">
              Update your password to maintain account integrity.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="p-8 md:p-10 space-y-8">
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
                className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1"
              >
                New Secure Password
              </Label>
              <div className="relative group">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  className={cn(
                    "pl-11 h-12 rounded-2xl border-slate-200 bg-white focus:ring-4 focus:ring-blue-50 transition-all",
                    errors.password && "border-red-500 focus:ring-red-50"
                  )}
                  placeholder="••••••••"
                />
              </div>
              <div className="flex items-center justify-between px-1">
                <p
                  className={cn(
                    "text-[11px] font-bold transition-colors",
                    errors.password ? "text-red-500" : "text-slate-400"
                  )}
                >
                  {errors.password
                    ? errors.password.message
                    : "Minimum 8 characters required"}
                </p>
                {newPassword.length >= 8 && !errors.password && (
                  <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1">
                    <Check className="h-3 w-3" strokeWidth={3} /> Strong
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="confirmPassword"
                className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1"
              >
                Verify New Password
              </Label>
              <div className="relative group">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  className={cn(
                    "pl-11 h-12 rounded-2xl border-slate-200 bg-white focus:ring-4 focus:ring-blue-50 transition-all",
                    errors.confirmPassword && "border-red-500 focus:ring-red-50"
                  )}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] font-bold text-red-500 ml-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-8 flex justify-end">
          <Button
            type="submit"
            disabled={isUpdating}
            className="w-full sm:w-auto min-w-[180px] h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black text-white shadow-xl shadow-blue-200 transition-all active:scale-95"
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