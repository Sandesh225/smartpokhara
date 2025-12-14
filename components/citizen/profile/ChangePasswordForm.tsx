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
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
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
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormData) => {
    setIsUpdating(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    setIsUpdating(false);

    if (error) {
      setErrorMsg(error.message);
      toast.error("Failed to update password");
    } else {
      toast.success("Password updated successfully");
      reset();
    }
  };

  return (
    <Card className="border-none shadow-md bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password to keep your account secure.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {errorMsg && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-5">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  className={cn(
                    "pl-9",
                    errors.password &&
                      "border-red-500 focus-visible:ring-red-500"
                  )}
                  placeholder="Min 8 characters"
                />
              </div>
              {errors.password ? (
                <p className="text-xs text-red-500 font-medium">
                  {errors.password.message}
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  Must contain at least 8 characters
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  className={cn(
                    "pl-9",
                    errors.confirmPassword &&
                      "border-red-500 focus-visible:ring-red-500"
                  )}
                  placeholder="Retype new password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-slate-50 border-t p-6">
          <Button
            type="submit"
            disabled={isUpdating}
            className="w-full sm:w-auto ml-auto"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Update Password
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}