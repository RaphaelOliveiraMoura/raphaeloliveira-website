import { z } from "zod";

// ---- Shared field schemas ----
const nameField = z.string().min(2).max(255);
const emailField = z.string().email();
const passwordField = z.string().min(6).max(128);
const roleField = z.enum(["admin", "user"]);

// ---- Request schemas ----

export const createUserSchema = z.object({
  name: nameField,
  email: emailField,
  password: passwordField,
  role: roleField.optional().default("user"),
});

export const updateUserSchema = z.object({
  name: nameField.optional(),
  email: emailField.optional(),
  role: roleField.optional(),
});

export const userParamsSchema = z.object({
  id: z.string().uuid(),
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  role: roleField.optional(),
});

// ---- Response schemas ----

export const userResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const usersListResponseSchema = z.object({
  data: z.array(userResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

// ---- Inferred types ----

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserParams = z.infer<typeof userParamsSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
