"use client";

import { useCallback, useState } from "react";

import { isClient } from "@/lib/utils/environment";

interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
}

export function useShare() {
  const [sharing, setSharing] = useState(false);

  const share = useCallback(async (options: ShareOptions): Promise<boolean> => {
    setSharing(true);
    try {
      if (isClient() && navigator.share) {
        await navigator.share(options);
        return true;
      }
      // Fallback: copy URL to clipboard
      if (options.url) {
        await navigator.clipboard.writeText(options.url);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setSharing(false);
    }
  }, []);

  return { share, sharing };
}
