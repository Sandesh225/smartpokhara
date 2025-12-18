"use client";

import React from "react";

export const GradientBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-950">
    <div className="absolute inset-0 bg-linear-to-br from-blue-600/20 via-slate-950 to-purple-600/20" />
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
  </div>
);

export const PremiumCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`relative group ${className}`}>
    <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500 to-purple-500 rounded-3xl opacity-20 group-hover:opacity-30 blur transition duration-500" />
    <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
      {children}
    </div>
  </div>
);

export const FloatingLabel = ({
  label,
  icon: Icon,
  focused,
  hasValue,
}: {
  label: string;
  icon: any;
  focused: boolean;
  hasValue: boolean;
}) => (
  <div
    className={`absolute left-4 transition-all duration-300 pointer-events-none flex items-center gap-2
    ${
      focused || hasValue
        ? "-top-3 text-xs text-blue-400 bg-slate-900 px-2 rounded-full"
        : "top-3.5 text-sm text-slate-400"
    }`}
  >
    {Icon && (
      <Icon
        size={focused || hasValue ? 12 : 16}
        className="transition-all duration-300"
      />
    )}
    <span className="font-medium">{label}</span>
  </div>
);

export const PasswordStrength = ({ password }: { password: string }) => {
  const getStrength = () => {
    if (!password) return { level: 0, text: "", color: "" };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;

    const levels = [
      { level: 0, text: "", color: "" },
      { level: 1, text: "Weak", color: "bg-red-500" },
      { level: 2, text: "Fair", color: "bg-orange-500" },
      { level: 3, text: "Good", color: "bg-yellow-500" },
      { level: 4, text: "Strong", color: "bg-green-500" },
    ];
    return levels[strength] || levels[0];
  };

  const strength = getStrength();
  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              level <= strength.level ? strength.color : "bg-slate-700"
            }`}
          />
        ))}
      </div>
      {strength.text && (
        <p className="text-xs text-slate-400">
          Password strength:{" "}
          <span
            className={`font-semibold ${strength.color.replace(
              "bg-",
              "text-"
            )}`}
          >
            {strength.text}
          </span>
        </p>
      )}
    </div>
  );
};