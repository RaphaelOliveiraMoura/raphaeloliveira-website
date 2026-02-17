import { generateOgImage } from "@/lib/seo/og-image";

export const runtime = "edge";
export const alt = "Raphael Oliveira — Software Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return generateOgImage({
    title: "Raphael Oliveira",
    description: "Software Engineer | React, Node.js, TypeScript",
    badge: "Portfolio",
  });
}
