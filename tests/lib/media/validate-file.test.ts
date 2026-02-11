import { describe, it, expect } from "vitest";
import { validateFile } from "@/lib/media/validate-file";

describe("validateFile", () => {
  const createFile = (name: string, size: number, type: string): File => {
    const content = new Uint8Array(size);
    return new File([content], name, { type });
  };

  it("validates a file within size limit", () => {
    const file = createFile("test.png", 1024, "image/png");
    const result = validateFile(file, { maxSize: 2048 });
    expect(result.valid).toBe(true);
  });

  it("rejects a file exceeding size limit", () => {
    const file = createFile("big.png", 5 * 1024 * 1024, "image/png");
    const result = validateFile(file, { maxSize: 2 * 1024 * 1024 });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("tamanho máximo");
  });

  it("validates allowed file types", () => {
    const file = createFile("doc.pdf", 1024, "application/pdf");
    const result = validateFile(file, { allowedTypes: ["image/png", "image/jpeg"] });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("não permitido");
  });

  it("accepts valid file type", () => {
    const file = createFile("photo.jpg", 1024, "image/jpeg");
    const result = validateFile(file, { allowedTypes: ["image/jpeg", "image/png"] });
    expect(result.valid).toBe(true);
  });

  it("passes with no constraints", () => {
    const file = createFile("any.txt", 999, "text/plain");
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });
});
