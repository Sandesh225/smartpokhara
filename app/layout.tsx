// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { ThemeModeScript } from "flowbite-react";
import "./globals.css";
import { Providers } from "./providers";
import { Logo } from "@/components/ui/Logo";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0f4169" }, // Pokhara Blue
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    template: "%s | Smart Pokhara Portal",
    default: "Smart City Pokhara – Official Metropolitan Services",
  },
  description:
    "The official digital platform for citizens of Pokhara Metropolitan City. Access public services, pay taxes, and report municipal issues securely.",
  keywords: [
    "Pokhara",
    "Smart City",
    "Nepal Government",
    "Public Services",
    "Ward Directory",
  ],
  authors: [{ name: "Pokhara Metropolitan City IT Department" }],
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" }, // Modern SVG icon support
    ],
    apple: [
      { url: "/apple-touch-icon.png" }, // Recommended for iOS
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth" suppressHydrationWarning>
      <head>
        <ThemeModeScript />
      </head>
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
