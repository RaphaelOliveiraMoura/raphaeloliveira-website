import { createTransport, type Transporter } from "nodemailer";

import { logger } from "../../lib/logger";
import type {
  MailProvider,
  SendMailOptions,
  SendMailResult,
} from "./mail.port";

const log = logger.child({ module: "mail:nodemailer" });

export interface NodemailerConfig {
  host: string;
  port: number;
  secure?: boolean;
  user?: string;
  pass?: string;
  from: string;
}

/**
 * Nodemailer adapter for sending emails via SMTP.
 *
 * Use in production or staging environments with a real SMTP server.
 */
export class NodemailerMailAdapter implements MailProvider {
  private transporter: Transporter;
  private from: string;

  constructor(config: NodemailerConfig) {
    this.from = config.from;

    this.transporter = createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure ?? config.port === 465,
      ...(config.user && config.pass
        ? { auth: { user: config.user, pass: config.pass } }
        : {}),
    });

    log.info(
      { host: config.host, port: config.port },
      "Nodemailer transport initialized",
    );
  }

  async send(options: SendMailOptions): Promise<SendMailResult> {
    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        cc: options.cc,
        bcc: options.bcc,
        replyTo: options.replyTo,
        attachments: options.attachments?.map((a) => ({
          filename: a.filename,
          content: a.content,
          contentType: a.contentType,
        })),
      });

      log.info(
        { messageId: info.messageId, to: options.to },
        "Email sent via SMTP",
      );

      return { success: true, messageId: info.messageId };
    } catch (error) {
      log.error({ error, to: options.to }, "Failed to send email via SMTP");
      return { success: false };
    }
  }

  async verify(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch {
      return false;
    }
  }
}
