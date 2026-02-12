import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Core Stack";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
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
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "32px",
            fontWeight: 700,
          }}
        >
          CS
        </div>
        <span style={{ fontSize: "48px", fontWeight: 700 }}>Core Stack</span>
      </div>
      <p
        style={{
          fontSize: "24px",
          color: "#94a3b8",
          maxWidth: "600px",
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        Template profissional para aplicações Next.js
      </p>
      <div
        style={{
          display: "flex",
          gap: "32px",
          marginTop: "40px",
          fontSize: "16px",
          color: "#64748b",
        }}
      >
        <span>Next.js 16</span>
        <span>•</span>
        <span>React 19</span>
        <span>•</span>
        <span>TypeScript</span>
        <span>•</span>
        <span>Tailwind v4</span>
      </div>
    </div>,
    { ...size },
  );
}
