// ============================================
// FILE: components/auth/PasswordStrength.tsx
// ============================================
"use client";

import { CheckCircle2, XCircle } from "lucide-react";

export function PasswordStrength({ password }: { password: string }) {
  const getStrength = () => {
    if (!password) return { level: 0, label: "", color: "" };

    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { level: 1, label: "Weak", color: "bg-red-500" };
    if (strength <= 4)
      return { level: 2, label: "Fair", color: "bg-yellow-500" };
    if (strength <= 5) return { level: 3, label: "Good", color: "bg-blue-500" };
    return { level: 4, label: "Strong", color: "bg-green-500" };
  };

  const strength = getStrength();

  if (!password) return null;

  const checks = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "Contains uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", valid: /[a-z]/.test(password) },
    { label: "Contains number", valid: /[0-9]/.test(password) },
  ];

  return (
    <div className="mt-3 space-y-3">
      {/* Strength Bars */}
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              level <= strength.level ? strength.color : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Strength Label */}
      {strength.label && (
        <p className="text-xs font-medium text-gray-600">
          Password strength:{" "}
          <span
            className={`${
              strength.level === 1
                ? "text-red-600"
                : strength.level === 2
                  ? "text-yellow-600"
                  : strength.level === 3
                    ? "text-blue-600"
                    : "text-green-600"
            }`}
          >
            {strength.label}
          </span>
        </p>
      )}

      {/* Requirements Checklist */}
      <div className="space-y-1.5 pt-1">
        {checks.map((check, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            {check.valid ? (
              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 text-gray-300 shrink-0" />
            )}
            <span className={check.valid ? "text-green-600" : "text-gray-500"}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
