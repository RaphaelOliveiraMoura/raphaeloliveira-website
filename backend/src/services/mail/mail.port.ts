/**
 * Options for sending an email.
 */
export interface SendMailOptions {
  /** Recipient email address(es). */
  to: string | string[];
  /** Email subject line. */
  subject: string;
  /** HTML body content. */
  html: string;
  /** Optional plain text fallback. */
  text?: string;
  /** Optional CC recipients. */
  cc?: string | string[];
  /** Optional BCC recipients. */
  bcc?: string | string[];
  /** Optional reply-to address. */
  replyTo?: string;
  /** Optional attachments. */
  attachments?: MailAttachment[];
}

/**
 * Email attachment definition.
 */
export interface MailAttachment {
  /** Filename to use in the email. */
  filename: string;
  /** Content as a string, Buffer, or readable stream. */
  content: string | Buffer;
  /** MIME type (e.g. "application/pdf"). */
  contentType?: string;
}

/**
 * Result of sending an email.
 */
export interface SendMailResult {
  /** Whether the email was sent successfully. */
  success: boolean;
  /** Message ID assigned by the mail server (if available). */
  messageId?: string;
}

/**
 * Mail provider interface (Port).
 *
 * All mail adapters must implement this interface.
 * Services depend only on this contract, never on specific implementations.
 *
 * @example
 * ```ts
 * // Using the container
 * const mail = container.resolve<MailProvider>("mail");
 * await mail.send({
 *   to: "user@example.com",
 *   subject: "Welcome!",
 *   html: "<h1>Welcome to Core Stack</h1>",
 * });
 * ```
 */
export interface MailProvider {
  /**
   * Send an email.
   */
  send(options: SendMailOptions): Promise<SendMailResult>;

  /**
   * Check if the mail provider is properly configured and reachable.
   */
  verify(): Promise<boolean>;
}
