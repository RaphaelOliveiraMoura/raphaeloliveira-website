import { randomBytes } from "node:crypto";

import type { ApiKey } from "../../db/schema/api-keys";
import { sha256 } from "../../lib/crypto";
import { ForbiddenError, NotFoundError } from "../../lib/errors";
import { ApiKeysRepository } from "./api-keys.repository";
import type { CreateApiKeyInput } from "./api-keys.schemas";

/** Length of the generated API key in bytes (results in 64 hex chars). */
const KEY_BYTES = 32;

/** Prefix length (first N chars of the key, visible in listings). */
const PREFIX_LENGTH = 8;

export class ApiKeysService {
  private repository = new ApiKeysRepository();

  /**
   * Create a new API key. Returns the full key only once.
   */
  async create(
    userId: string,
    input: CreateApiKeyInput,
  ): Promise<{ key: string; apiKey: ApiKey }> {
    const rawKey = `csk_${randomBytes(KEY_BYTES).toString("hex")}`;
    const prefix = rawKey.slice(0, PREFIX_LENGTH);
    const keyHash = sha256(rawKey);

    const apiKey = await this.repository.create({
      name: input.name,
      prefix,
      keyHash,
      userId,
      scopes: input.scopes,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    });

    return { key: rawKey, apiKey };
  }

  /**
   * List all active API keys for a user (without the full key).
   */
  async listByUserId(userId: string): Promise<ApiKey[]> {
    return this.repository.findActiveByUserId(userId);
  }

  /**
   * Revoke an API key. Users can only revoke their own keys.
   */
  async revoke(id: string, userId: string): Promise<void> {
    const apiKey = await this.repository.findById(id);

    if (!apiKey) {
      throw new NotFoundError("API Key", id);
    }

    if (apiKey.userId !== userId) {
      throw new ForbiddenError("You can only revoke your own API keys");
    }

    await this.repository.revoke(id);
  }

  /**
   * Validate an API key and return the associated key record.
   * Used by the authenticate-api-key hook.
   */
  async validateKey(rawKey: string): Promise<ApiKey | null> {
    const prefix = rawKey.slice(0, PREFIX_LENGTH);
    const apiKey = await this.repository.findByPrefix(prefix);

    if (!apiKey) return null;

    // Compare hashes
    const incomingHash = sha256(rawKey);
    if (incomingHash !== apiKey.keyHash) return null;

    // Check expiration
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null;

    // Update last used
    await this.repository.updateLastUsed(apiKey.id);

    return apiKey;
  }
}
