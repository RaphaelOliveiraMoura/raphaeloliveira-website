/**
 * Metadata for an uploaded file.
 */
export interface UploadMetadata {
  /** MIME type of the file. */
  contentType?: string;
  /** Original filename. */
  originalName?: string;
  /** Custom metadata key-value pairs. */
  custom?: Record<string, string>;
}

/**
 * Result of a file upload operation.
 */
export interface UploadResult {
  /** Storage key (path) for the uploaded file. */
  key: string;
  /** Public or internal URL of the file (if applicable). */
  url?: string;
  /** File size in bytes. */
  size: number;
}

/**
 * Result of a file download operation.
 */
export interface DownloadResult {
  /** File content as a Buffer. */
  data: Buffer;
  /** MIME type of the file. */
  contentType?: string;
  /** File size in bytes. */
  size: number;
}

/**
 * Storage provider interface (Port).
 *
 * All storage adapters must implement this interface.
 * Services depend only on this contract, never on specific implementations.
 *
 * @example
 * ```ts
 * const storage = container.resolve<StorageProvider>("storage");
 * const result = await storage.upload("avatars/user-123.jpg", fileBuffer, {
 *   contentType: "image/jpeg",
 * });
 * ```
 */
export interface StorageProvider {
  /**
   * Upload a file to storage.
   */
  upload(
    key: string,
    data: Buffer,
    metadata?: UploadMetadata,
  ): Promise<UploadResult>;

  /**
   * Download a file from storage.
   */
  download(key: string): Promise<DownloadResult>;

  /**
   * Delete a file from storage.
   */
  delete(key: string): Promise<void>;

  /**
   * Generate a pre-signed URL for temporary access to a file.
   *
   * @param key - Storage key of the file
   * @param expiresInSeconds - How long the URL is valid (default: 3600)
   */
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;

  /**
   * Check if a file exists in storage.
   */
  exists(key: string): Promise<boolean>;

  /**
   * Check if the storage provider is properly configured and reachable.
   */
  verify(): Promise<boolean>;
}
