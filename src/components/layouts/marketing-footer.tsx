import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-8 md:py-12">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div>
            <Link href="/" className="text-lg font-semibold">
              Logo
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Template base universal para projetos Next.js
            </p>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:gap-8">
            <div>
              <h3 className="text-sm font-medium">Produto</h3>
              <ul className="mt-2 space-y-2">
                <li>
                  <Link
                    href="/features"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium">Recursos</h3>
              <ul className="mt-2 space-y-2">
                <li>
                  <Link
                    href="/docs"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Documentação
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Core Stack. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
