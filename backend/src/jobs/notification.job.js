import { Notification } from '../shared/models/Notification.model.js';
import { logger } from '../shared/utils/logger.js';

export async function enqueueNotificationPayload(payload) {
  const doc = await Notification.create(payload);
  logger.info('Notification persisted', { id: doc._id, recipientType: doc.recipientType, type: doc.type });
  return doc;
}
