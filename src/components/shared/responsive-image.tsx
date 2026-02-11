import Image from "next/image";

import { cn } from "@/lib/utils";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  blurDataURL?: string;
  fill?: boolean;
  sizes?: string;
}

export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  blurDataURL,
  fill = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
}: ResponsiveImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      fill={fill}
      sizes={sizes}
      priority={priority}
      placeholder={blurDataURL ? "blur" : "empty"}
      blurDataURL={blurDataURL}
      loading={priority ? undefined : "lazy"}
      className={cn(className)}
    />
  );
}
