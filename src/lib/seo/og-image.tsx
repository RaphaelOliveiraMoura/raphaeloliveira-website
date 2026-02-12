import { ImageResponse } from "next/og";

interface OgImageOptions {
  title: string;
  description?: string;
  badge?: string;
}

/**
 * Gera uma ImageResponse padronizada para OG images dinamicas.
 * Usar em arquivos `opengraph-image.tsx` de cada rota.
 *
 * @example
 * ```tsx
 * // src/app/[locale]/blog/[slug]/opengraph-image.tsx
 * import { generateOgImage } from "@/lib/seo/og-image";
 *
 * export default function OgImage() {
 *   return generateOgImage({ title: "Post Title", badge: "Blog" });
 * }
 * ```
 */
export function generateOgImage({
  title,
  description,
  badge,
}: OgImageOptions): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        padding: "80px",
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        color: "white",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            fontWeight: 700,
          }}
        >
          CS
        </div>
        <span style={{ fontSize: "20px", color: "#94a3b8" }}>Core Stack</span>
        {badge && (
          <>
            <span style={{ color: "#475569" }}>•</span>
            <span
              style={{
                fontSize: "16px",
                color: "#3b82f6",
                background: "rgba(59, 130, 246, 0.1)",
                padding: "4px 12px",
                borderRadius: "9999px",
              }}
            >
              {badge}
            </span>
          </>
        )}
      </div>
      <h1
        style={{
          fontSize: title.length > 40 ? "40px" : "56px",
          fontWeight: 700,
          lineHeight: 1.2,
          maxWidth: "900px",
          margin: 0,
        }}
      >
        {title}
      </h1>
      {description && (
        <p
          style={{
            fontSize: "24px",
            color: "#94a3b8",
            maxWidth: "700px",
            lineHeight: 1.5,
            marginTop: "16px",
          }}
        >
          {description}
        </p>
      )}
    </div>,
    { width: 1200, height: 630 },
  );
}
