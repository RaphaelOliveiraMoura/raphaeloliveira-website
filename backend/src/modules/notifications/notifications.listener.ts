import { domainEvents } from "../../lib/events";
import { logger } from "../../lib/logger";
import { NotificationsService } from "./notifications.service";

const log = logger.child({ module: "notifications:listener" });

const notificationsService = new NotificationsService();

/**
 * Register domain event listeners that create notifications.
 * Called during app bootstrap.
 */
export function registerNotificationListeners(): void {
  domainEvents.on("user.created", async ({ userId }) => {
    try {
      await notificationsService.create({
        userId,
        type: "info",
        channel: "system",
        title: "Bem-vindo ao Core Stack!",
        body: "Sua conta foi criada com sucesso. Explore as funcionalidades disponíveis.",
      });
    } catch (err) {
      log.error(
        { error: err, userId },
        "Failed to create welcome notification",
      );
    }
  });

  domainEvents.on("auth.password.reset.completed", async ({ userId }) => {
    try {
      await notificationsService.create({
        userId,
        type: "warning",
        channel: "auth",
        title: "Senha alterada",
        body: "Sua senha foi redefinida com sucesso. Se você não fez essa alteração, entre em contato com o suporte.",
      });
    } catch (err) {
      log.error(
        { error: err, userId },
        "Failed to create password reset notification",
      );
    }
  });

  domainEvents.on("auth.email.verified", async ({ userId }) => {
    try {
      await notificationsService.create({
        userId,
        type: "success",
        channel: "auth",
        title: "Email verificado",
        body: "Seu endereço de email foi verificado com sucesso.",
      });
    } catch (err) {
      log.error(
        { error: err, userId },
        "Failed to create email verified notification",
      );
    }
  });

  domainEvents.on("auth.account.locked", async ({ userId }) => {
    try {
      await notificationsService.create({
        userId,
        type: "error",
        channel: "auth",
        title: "Conta bloqueada temporariamente",
        body: "Sua conta foi bloqueada devido a múltiplas tentativas de login. Tente novamente mais tarde.",
      });
    } catch (err) {
      log.error(
        { error: err, userId },
        "Failed to create account locked notification",
      );
    }
  });

  log.info("Notification listeners registered");
}
