interface CookieOptions {
  maxAge?: number;
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

import { isClient } from "@/lib/utils/environment";

export const cookies = {
  get(name: string): string | undefined {
    if (!isClient()) return undefined;
    const parsed = this.parse(document.cookie);
    return parsed[name];
  },

  set(name: string, value: string, options: CookieOptions = {}): void {
    if (!isClient()) return;

    const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];

    if (options.maxAge !== undefined) parts.push(`max-age=${options.maxAge}`);
    if (options.expires) parts.push(`expires=${options.expires.toUTCString()}`);
    if (options.path) parts.push(`path=${options.path}`);
    if (options.domain) parts.push(`domain=${options.domain}`);
    if (options.secure) parts.push("secure");
    if (options.sameSite) parts.push(`samesite=${options.sameSite}`);

    document.cookie = parts.join("; ");
  },

  delete(name: string, path = "/"): void {
    if (!isClient()) return;
    document.cookie = `${encodeURIComponent(name)}=; max-age=0; path=${path}`;
  },

  parse(cookieString: string): Record<string, string> {
    const result: Record<string, string> = {};
    if (!cookieString) return result;

    cookieString.split(";").forEach((pair) => {
      const [key, ...rest] = pair.split("=");
      const trimmedKey = key?.trim();
      if (trimmedKey) {
        result[decodeURIComponent(trimmedKey)] = decodeURIComponent(
          rest.join("=").trim()
        );
      }
    });

    return result;
  },
};
