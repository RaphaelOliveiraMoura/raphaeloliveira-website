import {
  DashboardNavbar,
  DashboardSidebar,
  PageTransition,
} from "@/components/layouts";
import { CommandPalette } from "@/components/navigation";

import { generateMetadata as generateSeoMetadata } from "@/lib/seo";

import { AuthProvider } from "@/providers/auth-provider";

export const metadata = generateSeoMetadata({
  title: "Dashboard — Core Stack",
  description: "Painel de controle com dados, formularios e configuracoes.",
  path: "/dashboard",
  noIndex: true,
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col">
          <DashboardNavbar />
          <main className="flex-1 p-4 lg:p-6">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
      <CommandPalette />
    </AuthProvider>
  );
}
