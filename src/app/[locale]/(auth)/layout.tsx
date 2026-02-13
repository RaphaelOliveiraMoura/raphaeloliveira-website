import { Layers } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-muted/50 to-muted p-4">
      {/* Branding */}
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Layers className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-2xl font-bold tracking-tight">Core Stack</span>
      </div>

      {/* Content */}
      <div className="w-full max-w-md">{children}</div>

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Core Stack
      </p>
    </div>
  );
}
