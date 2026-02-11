export type Role = "admin" | "editor" | "user";

export type Permission =
  | "users:read"
  | "users:create"
  | "users:update"
  | "users:delete"
  | "posts:read"
  | "posts:create"
  | "posts:update"
  | "posts:delete"
  | "settings:read"
  | "settings:update";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    "users:read",
    "users:create",
    "users:update",
    "users:delete",
    "posts:read",
    "posts:create",
    "posts:update",
    "posts:delete",
    "settings:read",
    "settings:update",
  ],
  editor: [
    "users:read",
    "posts:read",
    "posts:create",
    "posts:update",
    "settings:read",
  ],
  user: ["users:read", "posts:read"],
};
