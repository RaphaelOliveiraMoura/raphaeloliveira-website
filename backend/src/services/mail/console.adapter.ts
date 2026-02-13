import { logger } from "../../lib/logger";
import type {
  MailProvider,
  SendMailOptions,
  SendMailResult,
} from "./mail.port";

const log = logger.child({ module: "mail:console" });

/**
 * Console mail adapter — logs emails to stdout instead of sending them.
 *
 * Use in development and test environments.
 */
export class ConsoleMailAdapter implements MailProvider {
  async send(options: SendMailOptions): Promise<SendMailResult> {
    const messageId = `console-${Date.now()}`;

    log.info(
      {
        messageId,
        to: options.to,
        subject: options.subject,
        hasHtml: !!options.html,
        hasText: !!options.text,
        cc: options.cc,
        bcc: options.bcc,
      },
      "Email logged (console adapter — not sent)",
    );

    // In development, also log the HTML body for debugging
    log.debug({ html: options.html }, "Email HTML body");

    return { success: true, messageId };
  }

  async verify(): Promise<boolean> {
    return true;
  }
}
