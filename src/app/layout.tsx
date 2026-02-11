import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Core Stack",
  description: "Template base universal para projetos Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
