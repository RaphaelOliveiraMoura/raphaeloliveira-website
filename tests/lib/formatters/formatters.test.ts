import { formatCurrency } from "@/lib/formatters/currency";
import { abbreviateNumber } from "@/lib/formatters/number";
import { formatCpf, formatCnpj, formatCep } from "@/lib/formatters/document";
import {
  truncate,
  capitalize,
  slugify,
  pluralize,
} from "@/lib/formatters/string";
import { formatAddress } from "@/lib/formatters/address";

describe("formatCurrency", () => {
  it("formats BRL by default", () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain("1.234,56");
  });

  it("formats USD with en-US locale", () => {
    const result = formatCurrency(1234.56, {
      currency: "USD",
      locale: "en-US",
    });
    expect(result).toContain("1,234.56");
  });
});

describe("abbreviateNumber", () => {
  it("abbreviates large numbers", () => {
    const result = abbreviateNumber(1200, { locale: "en-US" });
    expect(result).toContain("1.2K");
  });
});

describe("document formatters", () => {
  it("formats CPF", () => {
    expect(formatCpf("12345678900")).toBe("123.456.789-00");
  });

  it("formats CNPJ", () => {
    expect(formatCnpj("12345678000100")).toBe("12.345.678/0001-00");
  });

  it("formats CEP", () => {
    expect(formatCep("01310100")).toBe("01310-100");
  });
});

describe("string utilities", () => {
  it("truncates long strings", () => {
    expect(truncate("Hello World", 8)).toBe("Hello...");
  });

  it("returns short strings as-is", () => {
    expect(truncate("Hi", 10)).toBe("Hi");
  });

  it("capitalizes", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  it("slugifies", () => {
    expect(slugify("Olá Mundo!")).toBe("ola-mundo");
  });

  it("pluralizes", () => {
    expect(pluralize(1, "item")).toBe("item");
    expect(pluralize(5, "item")).toBe("items");
    expect(pluralize(0, "item", "itens")).toBe("itens");
  });
});

describe("formatAddress", () => {
  it("formats Brazilian address", () => {
    const result = formatAddress({
      street: "Av. Brasil",
      number: "1000",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      zipCode: "01310100",
    });
    expect(result).toContain("Av. Brasil, 1000");
    expect(result).toContain("Centro");
    expect(result).toContain("São Paulo - SP");
    expect(result).toContain("01310-100");
  });
});
