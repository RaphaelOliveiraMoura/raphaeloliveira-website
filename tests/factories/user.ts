import { factory } from "./factory";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "editor";
  createdAt: string;
}

export const userFactory = factory<User>(() => ({
  id: crypto.randomUUID(),
  name: "João Silva",
  email: "joao@example.com",
  role: "user" as const,
  createdAt: new Date().toISOString(),
}));
