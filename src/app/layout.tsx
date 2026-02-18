import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { calculateYearsOfExperience } from "@/lib/utils/years-of-experience";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Raphael Oliveira — Software Engineer",
  description: `Portfolio de Raphael de Oliveira Moura — Desenvolvedor fullstack com +${calculateYearsOfExperience()} anos de experiência em React, Node.js e TypeScript.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
