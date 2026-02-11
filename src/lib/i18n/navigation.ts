import { createNavigation } from "next-intl/navigation";

import { routing } from "@/i18n/routing";

/**
 * Abstracoes de navegacao locale-aware.
 *
 * Este e o UNICO arquivo que importa de "next-intl/navigation".
 * Componentes renderizados sob [locale] devem usar estas abstracoes
 * em vez de importar Link/useRouter/usePathname de "next/link" ou "next/navigation".
 */
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
