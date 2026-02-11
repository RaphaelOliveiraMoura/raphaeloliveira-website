export function formatCpf(value: string | number): string {
  const digits = String(value).replace(/\D/g, "").padStart(11, "0");
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatCnpj(value: string | number): string {
  const digits = String(value).replace(/\D/g, "").padStart(14, "0");
  return digits.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    "$1.$2.$3/$4-$5"
  );
}

export function formatCep(value: string | number): string {
  const digits = String(value).replace(/\D/g, "").padStart(8, "0");
  return digits.replace(/(\d{5})(\d{3})/, "$1-$2");
}
