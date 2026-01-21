import type { Metadata, Viewport } from "next";
import { ThemeModeScript } from "flowbite-react";
import "./globals.css";
import { Providers } from "./providers";

export const viewport: Viewport = {
  themeColor: "#2B5F75",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    template: "%s | Smart City Pokhara",
    default: "Smart City Pokhara – Official Citizen Portal",
  },
  description: "The official digital platform for Pokhara Metropolitan City.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Injects theme logic immediately to prevent white flash */}
        <ThemeModeScript />
      </head>
      <body
        className="min-h-screen bg-background font-sans antialiased text-foreground selection:bg-primary/10 selection:text-primary"
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
