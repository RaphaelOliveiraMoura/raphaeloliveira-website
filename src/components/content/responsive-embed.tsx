import { AspectRatio } from "@/components/ui/aspect-ratio";

import { cn } from "@/lib/utils";

function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1] ?? null;
  }
  return null;
}

interface ResponsiveEmbedProps {
  type: "youtube" | "generic";
  url: string;
  title: string;
  className?: string;
}

export function ResponsiveEmbed({
  type,
  url,
  title,
  className,
}: ResponsiveEmbedProps) {
  const embedUrl =
    type === "youtube"
      ? (() => {
          const videoId = extractYouTubeVideoId(url);
          return videoId
            ? `https://www.youtube.com/embed/${videoId}?rel=0`
            : url;
        })()
      : url;

  return (
    <AspectRatio
      ratio={16 / 9}
      className={cn("overflow-hidden rounded-lg", className)}
    >
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="size-full"
      />
    </AspectRatio>
  );
}
