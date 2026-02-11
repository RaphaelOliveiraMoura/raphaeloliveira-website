import { describe, it, expect } from "vitest";
import { generateMetadata } from "@/lib/seo/metadata";

describe("generateMetadata", () => {
  it("generates basic metadata with title and description", () => {
    const meta = generateMetadata({
      title: "Test Page",
      description: "Test description",
    });
    expect(meta.title).toBe("Test Page");
    expect(meta.description).toBe("Test description");
  });

  it("generates canonical URL from path", () => {
    const meta = generateMetadata({
      title: "Test",
      description: "Desc",
      path: "/about",
    });
    expect(meta.alternates?.canonical).toContain("/about");
  });

  it("sets noIndex robots when specified", () => {
    const meta = generateMetadata({
      title: "Private",
      description: "Hidden",
      noIndex: true,
    });
    expect(meta.robots).toEqual({ index: false, follow: false });
  });

  it("generates Open Graph metadata", () => {
    const meta = generateMetadata({
      title: "OG Test",
      description: "OG Desc",
      type: "article",
    });
    expect(meta.openGraph).toBeDefined();
    expect(meta.openGraph?.title).toBe("OG Test");
  });
});
