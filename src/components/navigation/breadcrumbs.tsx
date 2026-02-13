"use client";

import React from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Link, usePathname, useTranslations } from "@/lib/i18n";

const LABELS: Record<string, string> = {
  dashboard: "nav.dashboard",
  users: "nav.users",
  posts: "nav.posts",
  settings: "nav.settings",
  products: "nav.products",
  admin: "nav.admin",
} as const;

type NavKey =
  | "nav.dashboard"
  | "nav.users"
  | "nav.posts"
  | "nav.settings"
  | "nav.products"
  | "nav.admin";

export function Breadcrumbs() {
  const pathname = usePathname();
  const t = useTranslations("common");
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((segment, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const key = LABELS[segment];
    const label = key ? t(key as NavKey) : segment;
    return { href, label };
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">{t("nav.home")}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {crumbs.map((c, i) => (
          <React.Fragment key={c.href}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {i === crumbs.length - 1 ? (
                <BreadcrumbPage>{c.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={c.href}>{c.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
