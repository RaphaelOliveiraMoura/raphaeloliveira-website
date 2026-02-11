import DOMPurify from "isomorphic-dompurify";

export interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
}

const DEFAULT_ALLOWED_TAGS = [
  "b",
  "i",
  "em",
  "strong",
  "a",
  "p",
  "br",
  "ul",
  "ol",
  "li",
  "span",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "code",
  "pre",
];

const DEFAULT_ALLOWED_ATTRS: Record<string, string[]> = {
  a: ["href", "title", "target", "rel"],
};

export function sanitizeHtml(dirty: string, options?: SanitizeOptions): string {
  const allowedTags = options?.allowedTags ?? DEFAULT_ALLOWED_TAGS;
  const allowedAttributes = options?.allowedAttributes ?? DEFAULT_ALLOWED_ATTRS;

  const attrArray: string[] = [];
  for (const attrs of Object.values(allowedAttributes)) {
    attrArray.push(...attrs);
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: attrArray,
  });
}
