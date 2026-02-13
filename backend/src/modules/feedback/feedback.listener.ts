import { domainEvents } from "../../lib/events";
import { logger } from "../../lib/logger";

const log = logger.child({ module: "feedback:listener" });

/**
 * Register domain event listeners for the feedback module.
 * Called during app bootstrap.
 */
export function registerFeedbackListeners(): void {
  domainEvents.on(
    "feedback.status.changed",
    async ({ feedbackId, newStatus, changedBy }) => {
      try {
        // Notify the feedback author when status changes
        // The changedBy is the admin who changed it; we'd need the original userId
        // For now, we log the event — in production, you'd look up the feedback author
        log.info(
          { feedbackId, newStatus, changedBy },
          "Feedback status changed",
        );
      } catch (err) {
        log.error(
          { error: err, feedbackId },
          "Failed to handle feedback status change",
        );
      }
    },
  );

  domainEvents.on(
    "feedback.response.added",
    async ({ feedbackId, responseId, userId, isInternal }) => {
      try {
        if (!isInternal) {
          log.info(
            { feedbackId, responseId, userId },
            "Public response added to feedback",
          );
        }
      } catch (err) {
        log.error(
          { error: err, feedbackId },
          "Failed to handle feedback response",
        );
      }
    },
  );

  log.info("Feedback listeners registered");
}
