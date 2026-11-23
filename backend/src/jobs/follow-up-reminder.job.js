import { FollowUp } from '../shared/models/FollowUp.model.js';
import { Notification } from '../shared/models/Notification.model.js';
import { logger } from '../shared/utils/logger.js';

export async function runFollowUpReminderJob() {
  const horizon = new Date(Date.now() + 30 * 60 * 1000);
  const due = await FollowUp.find({
    reminderSent: false,
    nextFollowUpAt: { $ne: null, $lte: horizon },
  }).populate('leadId', 'leadCode title');

  let sent = 0;
  for (const item of due) {
    await Notification.create({
      recipientType: 'USER',
      recipientId: item.userId,
      title: 'Upcoming Buyer Follow-Up',
      message: `Follow-up scheduled for ${item.leadId?.leadCode || 'your lead'}: ${item.note.slice(0, 120)}`,
      type: 'FOLLOW_UP',
      metadata: { followUpId: item._id, leadId: item.leadId?._id },
    });
    item.reminderSent = true;
    await item.save();
    sent++;
  }

  logger.info('Follow-up reminder job completed', { sent });
  return { sent };
}
