import { generateOgImage } from "@/lib/seo/og-image";

export const runtime = "edge";
export const alt = "Core Stack";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return generateOgImage({
    title: "Core Stack",
    description: "Template profissional para aplicações Next.js",
    badge: "Next.js 16",
  });
}
