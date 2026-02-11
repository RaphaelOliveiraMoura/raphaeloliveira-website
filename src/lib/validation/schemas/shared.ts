import { z } from "zod";

export const emailSchema = z
  .string()
  .min(1, "validation.email.required")
  .email("validation.email.invalid");

/** Aceita telefone fixo (10 dígitos): (99) 9999-9999 e celular (11 dígitos): (99) 99999-9999 */
export const phoneBrSchema = z
  .string()
  .regex(
    /^\(\d{2}\)\s?\d{4,5}-\d{4}$/,
    "validation.phone.invalid"
  );

export const cpfSchema = z
  .string()
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "validation.cpf.invalid");

export const cnpjSchema = z
  .string()
  .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "validation.cnpj.invalid");

export const cepSchema = z
  .string()
  .regex(/^\d{5}-?\d{3}$/, "validation.cep.invalid");

export const dateSchema = z
  .string()
  .regex(/^\d{2}\/\d{2}\/\d{4}$/, "validation.date.invalid");

export const currencySchema = z
  .string()
  .refine((v) => /^R\$\s?[\d.,]+$/.test(v), "validation.currency.invalid");
