/** Máscaras de input para documentos e formatos brasileiros */
export const masks = {
  phone: (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    }
    return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  },
  cpf: (value: string) => {
    const d = value.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  },
  cnpj: (value: string) => {
    const d = value.replace(/\D/g, "").slice(0, 14);
    if (d.length <= 2) return d;
    if (d.length <= 5) return d.replace(/(\d{2})(\d+)/, "$1.$2");
    if (d.length <= 8) return d.replace(/(\d{2})(\d{3})(\d+)/, "$1.$2.$3");
    if (d.length <= 12) return d.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, "$1.$2.$3/$4");
    return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, "$1.$2.$3/$4-$5");
  },
  cep: (value: string) => {
    const d = value.replace(/\D/g, "").slice(0, 8);
    return d.length > 5 ? d.replace(/(\d{5})(\d+)/, "$1-$2") : d;
  },
  date: (value: string) => {
    const d = value.replace(/\D/g, "").slice(0, 8);
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
    return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
  },
  currency: (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (!numbers) return "";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(numbers) / 100);
  },
  creditCard: (value: string) =>
    value
      .replace(/\D/g, "")
      .replace(/(\d{4})/g, "$1 ")
      .trim(),
} as const;

const maxDigits: Record<keyof typeof masks, number> = {
  cpf: 11,
  cnpj: 14,
  cep: 8,
  phone: 11,
  creditCard: 16,
  date: 8,
  currency: 15,
};

export type MaskType = keyof typeof masks;

/**
 * Aplica máscara ao valor, limitando pelos dígitos máximos do tipo.
 * Remove caracteres não numéricos antes de aplicar.
 */
export function applyMask(value: string, type: MaskType): string {
  const digits = value
    .replace(/\D/g, "")
    .slice(0, maxDigits[type] ?? 20);
  return masks[type](digits);
}
