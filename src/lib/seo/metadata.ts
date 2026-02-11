import type { Metadata } from "next";

interface MetadataInput {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  noIndex?: boolean;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export function generateMetadata(input: MetadataInput): Metadata {
  const url = input.path ? `${SITE_URL}${input.path}` : SITE_URL;
  const image = input.image ?? DEFAULT_OG_IMAGE;

  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: url },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: "Core Stack",
      images: [{ url: image, width: 1200, height: 630, alt: input.title }],
      type: input.type ?? "website",
      ...(input.publishedTime && { publishedTime: input.publishedTime }),
      ...(input.modifiedTime && { modifiedTime: input.modifiedTime }),
      ...(input.authors && { authors: input.authors }),
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image],
    },
    ...(input.noIndex && {
      robots: { index: false, follow: false },
    }),
  };
}
