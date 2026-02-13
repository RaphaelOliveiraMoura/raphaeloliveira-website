import { randomUUID } from "node:crypto";

import type { Upload } from "../../db/schema/index";
import { container } from "../../lib/container";
import { NotFoundError, ValidationError } from "../../lib/errors";
import {
  getOffset,
  paginate,
  type PaginatedResponse,
} from "../../lib/pagination";
import { sanitizeFilename } from "../../lib/sanitize";
import type { StorageProvider } from "../../services/storage/storage.port";
import { UploadsRepository } from "./uploads.repository";
import {
  ALLOWED_MIME_TYPES,
  type ListUploadsQuery,
  MAX_FILE_SIZE,
} from "./uploads.schemas";

interface UploadFileInput {
  filename: string;
  mimetype: string;
  data: Buffer;
  uploadedBy?: string;
}

function toDTO(upload: Upload, url?: string) {
  return {
    id: upload.id,
    key: upload.key,
    originalName: upload.originalName,
    contentType: upload.contentType,
    size: upload.size,
    uploadedBy: upload.uploadedBy,
    url,
    createdAt: upload.createdAt.toISOString(),
  };
}

export class UploadsService {
  private repository = new UploadsRepository();

  private get storage(): StorageProvider {
    return container.resolve("storage");
  }

  /**
   * Upload a file.
   */
  async upload(input: UploadFileInput) {
    // Validate MIME type
    if (
      !ALLOWED_MIME_TYPES.includes(
        input.mimetype as (typeof ALLOWED_MIME_TYPES)[number],
      )
    ) {
      throw new ValidationError({
        file: `File type "${input.mimetype}" is not allowed`,
      });
    }

    // Validate file size
    if (input.data.length > MAX_FILE_SIZE) {
      throw new ValidationError({
        file: `File size exceeds the maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      });
    }

    const safeName = sanitizeFilename(input.filename);
    const ext = safeName.includes(".") ? safeName.split(".").pop() : "";
    const key = `uploads/${randomUUID()}${ext ? `.${ext}` : ""}`;

    // Upload to storage provider
    await this.storage.upload(key, input.data, {
      contentType: input.mimetype,
      originalName: input.filename,
    });

    // Save metadata to database
    const upload = await this.repository.create({
      key,
      originalName: input.filename,
      contentType: input.mimetype,
      size: input.data.length,
      uploadedBy: input.uploadedBy,
    });

    const url = await this.storage.getSignedUrl(key);
    return toDTO(upload, url);
  }

  /**
   * Get upload metadata and a signed URL.
   */
  async getById(id: string) {
    const upload = await this.repository.findById(id);
    if (!upload) throw new NotFoundError("Upload", id);

    const url = await this.storage.getSignedUrl(upload.key);
    return toDTO(upload, url);
  }

  /**
   * List uploads with pagination.
   */
  async list(
    query: ListUploadsQuery,
  ): Promise<PaginatedResponse<ReturnType<typeof toDTO>>> {
    const offset = getOffset(query.page, query.limit);

    const { data, total } = await this.repository.findManyWithFilters({
      offset,
      limit: query.limit,
      search: query.search,
    });

    return paginate(
      data.map((u) => toDTO(u)),
      total,
      query.page,
      query.limit,
    );
  }

  /**
   * Delete an upload (file + metadata).
   */
  async delete(id: string): Promise<void> {
    const upload = await this.repository.findById(id);
    if (!upload) throw new NotFoundError("Upload", id);

    await this.storage.delete(upload.key);
    await this.repository.hardDelete(id);
  }
}
