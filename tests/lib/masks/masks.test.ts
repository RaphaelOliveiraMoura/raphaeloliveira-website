import { describe, it, expect } from "vitest";
import { applyMask } from "@/lib/masks";

describe("applyMask", () => {
  describe("CPF mask", () => {
    it("formats 11 digits as CPF (999.999.999-99)", () => {
      expect(applyMask("12345678901", "cpf")).toBe("123.456.789-01");
    });

    it("strips non-digits before applying mask", () => {
      expect(applyMask("123.456.789-01", "cpf")).toBe("123.456.789-01");
      expect(applyMask("12345678901abc", "cpf")).toBe("123.456.789-01");
    });

    it("limits to 11 digits", () => {
      expect(applyMask("12345678901234", "cpf")).toBe("123.456.789-01");
    });

    it("formats partial input progressively", () => {
      expect(applyMask("123", "cpf")).toBe("123");
      expect(applyMask("1234", "cpf")).toBe("123.4");
      expect(applyMask("123456", "cpf")).toBe("123.456");
      expect(applyMask("1234567", "cpf")).toBe("123.456.7");
      expect(applyMask("123456789", "cpf")).toBe("123.456.789");
    });
  });

  describe("CNPJ mask", () => {
    it("formats 14 digits as CNPJ (99.999.999/9999-99)", () => {
      expect(applyMask("12345678000199", "cnpj")).toBe(
        "12.345.678/0001-99"
      );
    });

    it("strips non-digits before applying mask", () => {
      expect(applyMask("12.345.678/0001-99", "cnpj")).toBe(
        "12.345.678/0001-99"
      );
    });

    it("limits to 14 digits", () => {
      expect(applyMask("12345678000199123", "cnpj")).toBe(
        "12.345.678/0001-99"
      );
    });

    it("formats partial input progressively", () => {
      expect(applyMask("12", "cnpj")).toBe("12");
      expect(applyMask("12345", "cnpj")).toBe("12.345");
      expect(applyMask("12345678", "cnpj")).toBe("12.345.678");
      expect(applyMask("123456780001", "cnpj")).toBe("12.345.678/0001");
    });
  });

  describe("CEP mask", () => {
    it("formats 8 digits as CEP (99999-999)", () => {
      expect(applyMask("01310100", "cep")).toBe("01310-100");
    });

    it("strips non-digits before applying mask", () => {
      expect(applyMask("01310-100", "cep")).toBe("01310-100");
      expect(applyMask("01310100xyz", "cep")).toBe("01310-100");
    });

    it("limits to 8 digits", () => {
      expect(applyMask("013101001234", "cep")).toBe("01310-100");
    });

    it("formats partial input (no hyphen until 6 digits)", () => {
      expect(applyMask("01310", "cep")).toBe("01310");
      expect(applyMask("013101", "cep")).toBe("01310-1");
      expect(applyMask("0131010", "cep")).toBe("01310-10");
    });
  });
});
