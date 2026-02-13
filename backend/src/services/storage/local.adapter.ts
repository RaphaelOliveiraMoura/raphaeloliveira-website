import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

import { logger } from "../../lib/logger";
import type {
  DownloadResult,
  StorageProvider,
  UploadMetadata,
  UploadResult,
} from "./storage.port";

const log = logger.child({ module: "storage:local" });

export interface LocalStorageConfig {
  /** Base directory for file storage. */
  basePath: string;
  /** Base URL for generating file URLs (optional). */
  baseUrl?: string;
}

/**
 * Local filesystem storage adapter.
 *
 * Stores files on the local filesystem. Use in development and testing.
 */
export class LocalStorageAdapter implements StorageProvider {
  private basePath: string;
  private baseUrl?: string;

  constructor(config: LocalStorageConfig) {
    this.basePath = resolve(config.basePath);
    this.baseUrl = config.baseUrl;

    log.info({ basePath: this.basePath }, "Local storage adapter initialized");
  }

  private getFilePath(key: string): string {
    // Prevent path traversal
    const normalizedKey = key.replace(/\.\./g, "").replace(/^\//, "");
    return join(this.basePath, normalizedKey);
  }

  async upload(
    key: string,
    data: Buffer,
    metadata?: UploadMetadata,
  ): Promise<UploadResult> {
    const filePath = this.getFilePath(key);

    // Ensure parent directory exists
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, data);

    // Store metadata as a sidecar JSON file
    if (metadata) {
      await writeFile(`${filePath}.meta.json`, JSON.stringify(metadata));
    }

    log.info({ key, size: data.length }, "File saved to local storage");

    return {
      key,
      url: this.baseUrl ? `${this.baseUrl}/${key}` : undefined,
      size: data.length,
    };
  }

  async download(key: string): Promise<DownloadResult> {
    const filePath = this.getFilePath(key);
    const data = await readFile(filePath);

    // Try to read metadata sidecar
    let contentType: string | undefined;
    try {
      const metaJson = await readFile(`${filePath}.meta.json`, "utf-8");
      const meta = JSON.parse(metaJson) as { contentType?: string };
      contentType = meta.contentType;
    } catch {
      // No metadata file, that's fine
    }

    return {
      data,
      contentType,
      size: data.length,
    };
  }

  async delete(key: string): Promise<void> {
    const filePath = this.getFilePath(key);

    try {
      await rm(filePath, { force: true });
      await rm(`${filePath}.meta.json`, { force: true });
      log.info({ key }, "File deleted from local storage");
    } catch {
      // File might not exist
    }
  }

  async getSignedUrl(key: string): Promise<string> {
    // Local storage doesn't support signed URLs —
    // return a direct path or URL
    if (this.baseUrl) {
      return `${this.baseUrl}/${key}`;
    }
    return this.getFilePath(key);
  }

  async exists(key: string): Promise<boolean> {
    try {
      await stat(this.getFilePath(key));
      return true;
    } catch {
      return false;
    }
  }

  async verify(): Promise<boolean> {
    try {
      await mkdir(this.basePath, { recursive: true });
      return true;
    } catch {
      return false;
    }
  }
}
