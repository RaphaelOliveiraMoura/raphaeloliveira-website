import type { User } from "../../db/schema/index";
import { ConflictError, NotFoundError } from "../../lib/errors";
import { hashPassword } from "../../lib/hash";
import {
  getOffset,
  paginate,
  type PaginatedResponse,
} from "../../lib/pagination";
import type { Transaction } from "../../lib/transaction";
import { UsersRepository } from "./users.repository";
import type {
  CreateUserInput,
  ListUsersQuery,
  UpdateUserInput,
} from "./users.schemas";
import type { UserDTO } from "./users.types";

/**
 * Map a database User row to a public DTO (no password hash).
 */
function toDTO(user: User): UserDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export class UsersService {
  private repository = new UsersRepository();

  /**
   * List users with pagination and filters.
   */
  async list(query: ListUsersQuery): Promise<PaginatedResponse<UserDTO>> {
    const offset = getOffset(query.page, query.limit);

    const { data, total } = await this.repository.findManyWithFilters({
      offset,
      limit: query.limit,
      search: query.search,
      role: query.role,
    });

    return paginate(data.map(toDTO), total, query.page, query.limit);
  }

  /**
   * Get a single user by ID.
   */
  async getById(id: string): Promise<UserDTO> {
    const user = await this.repository.findById(id);
    if (!user) throw new NotFoundError("User", id);
    return toDTO(user);
  }

  /**
   * Create a new user.
   */
  async create(input: CreateUserInput, tx?: Transaction): Promise<UserDTO> {
    const existing = await this.repository.findByEmail(input.email, tx);
    if (existing) throw new ConflictError("User", "email");

    const passwordHash = await hashPassword(input.password);
    const user = await this.repository.create(
      {
        name: input.name,
        email: input.email,
        passwordHash,
        role: input.role ?? "user",
      },
      tx,
    );

    return toDTO(user);
  }

  /**
   * Update a user by ID.
   */
  async update(id: string, input: UpdateUserInput): Promise<UserDTO> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError("User", id);

    // Check email uniqueness if changed
    if (input.email && input.email !== existing.email) {
      const emailTaken = await this.repository.findByEmail(input.email);
      if (emailTaken) throw new ConflictError("User", "email");
    }

    const updated = await this.repository.update(id, {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.email !== undefined && { email: input.email }),
      ...(input.role !== undefined && { role: input.role }),
    });

    if (!updated) throw new NotFoundError("User", id);
    return toDTO(updated);
  }

  /**
   * Delete a user by ID (soft delete).
   */
  async delete(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) throw new NotFoundError("User", id);
  }
}
