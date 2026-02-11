import { formatCep } from "./document";

export interface BrazilianAddress {
  street: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  zipCode: string;
}

export function formatAddress(address: BrazilianAddress): string {
  const parts = [
    address.street + (address.number ? `, ${address.number}` : ""),
    address.complement,
    address.neighborhood,
    `${address.city} - ${address.state}`,
    formatCep(address.zipCode),
  ].filter(Boolean);
  return parts.join(" \u2022 ");
}
