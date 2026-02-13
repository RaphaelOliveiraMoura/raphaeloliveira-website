import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { logger } from "../../lib/logger";
import type {
  DownloadResult,
  StorageProvider,
  UploadMetadata,
  UploadResult,
} from "./storage.port";

const log = logger.child({ module: "storage:s3" });

export interface S3StorageConfig {
  bucket: string;
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  /** Custom endpoint for S3-compatible services (MinIO, R2, etc.). */
  endpoint?: string;
  /** Force path-style addressing (required for MinIO). */
  forcePathStyle?: boolean;
}

/**
 * AWS S3 / S3-compatible storage adapter.
 *
 * Works with AWS S3, MinIO, Cloudflare R2, DigitalOcean Spaces, etc.
 */
export class S3StorageAdapter implements StorageProvider {
  private client: S3Client;
  private bucket: string;

  constructor(config: S3StorageConfig) {
    this.bucket = config.bucket;

    this.client = new S3Client({
      region: config.region,
      ...(config.endpoint ? { endpoint: config.endpoint } : {}),
      ...(config.forcePathStyle
        ? { forcePathStyle: config.forcePathStyle }
        : {}),
      ...(config.accessKeyId && config.secretAccessKey
        ? {
            credentials: {
              accessKeyId: config.accessKeyId,
              secretAccessKey: config.secretAccessKey,
            },
          }
        : {}),
    });

    log.info(
      {
        bucket: config.bucket,
        region: config.region,
        endpoint: config.endpoint,
      },
      "S3 storage adapter initialized",
    );
  }

  async upload(
    key: string,
    data: Buffer,
    metadata?: UploadMetadata,
  ): Promise<UploadResult> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: data,
        ContentType: metadata?.contentType,
        Metadata: metadata?.custom,
      }),
    );

    log.info({ key, size: data.length }, "File uploaded to S3");

    return {
      key,
      size: data.length,
    };
  }

  async download(key: string): Promise<DownloadResult> {
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );

    const bodyBytes = await response.Body?.transformToByteArray();
    const data = Buffer.from(bodyBytes ?? []);

    return {
      data,
      contentType: response.ContentType,
      size: data.length,
    };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );

    log.info({ key }, "File deleted from S3");
  }

  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: expiresInSeconds,
    });
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      return true;
    } catch {
      return false;
    }
  }

  async verify(): Promise<boolean> {
    try {
      // Try to HEAD a non-existent object — if the bucket is accessible, it will return a 404 (not throw)
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: "__health-check__",
        }),
      );
      return true;
    } catch (error: unknown) {
      // A 404 NotFound means the bucket is accessible, just the object doesn't exist
      if (error instanceof Error && error.name === "NotFound") {
        return true;
      }
      return false;
    }
  }
}
