// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const viewport: Viewport = {
  themeColor: "#2563eb", // Matches the brand blue
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Prevents input zooming on mobile
};

export const metadata: Metadata = {
  title: {
    template: "%s | Smart City Pokhara",
    default: "Smart City Pokhara – Official Citizen Portal",
  },
  description:
    "The official digital platform for Pokhara Metropolitan City. Submit complaints, pay taxes, and access municipal services online.",
  keywords: [
    "Pokhara",
    "Smart City",
    "Nepal Government",
    "Municipality Services",
  ],
  authors: [{ name: "Pokhara Metropolitan City IT Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://smart.pokhara.gov.np",
    siteName: "Smart City Pokhara",
    title: "Smart City Pokhara – Citizen Portal",
    description: "Connect with your local government seamlessly.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth" suppressHydrationWarning>
      <body
        className={`${inter.variable} min-h-screen bg-slate-50 font-sans antialiased text-slate-900 selection:bg-blue-100 selection:text-blue-900`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
