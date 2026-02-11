import {
  meetsContrastRatio,
  getContrastRatio,
} from "@/lib/utils/contrast";

describe("contrast utilities", () => {
  it("black on white meets AA", () => {
    expect(meetsContrastRatio("#000000", "#ffffff")).toBe(true);
  });

  it("white on white fails AA", () => {
    expect(meetsContrastRatio("#ffffff", "#ffffff")).toBe(false);
  });

  it("calculates ratio correctly for black/white", () => {
    const ratio = getContrastRatio("#000000", "#ffffff");
    expect(ratio).toBeCloseTo(21, 0);
  });

  it("AAA requires higher ratio", () => {
    // Light gray on white (ratio ~1.07) should fail both
    expect(meetsContrastRatio("#eeeeee", "#ffffff", "AAA")).toBe(false);
  });
});
