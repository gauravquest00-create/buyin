import { User } from '../../shared/models/User.model.js';
import { Notification } from '../../shared/models/Notification.model.js';
import { recordAdminAudit } from '../_helpers/audit.helper.js';

export async function broadcastNotification({ title, message, targetUserIds }, admin, ipAddress) {
  const users = targetUserIds?.length
    ? await User.find({ _id: { $in: targetUserIds } }).select('_id').lean()
    : await User.find().select('_id').lean();

  if (users.length > 0) {
    await Notification.insertMany(
      users.map((u) => ({
        recipientType: 'USER',
        recipientId: u._id,
        title,
        message,
        type: 'SYSTEM',
      }))
    );
  }

  await recordAdminAudit({
    admin,
    action: 'NOTIFICATION_BROADCAST',
    module: 'notification-management',
    afterState: { title, recipientCount: users.length },
    ipAddress,
  });
  return { sentCount: users.length };
}

export async function listRecentNotifications() {
  return Notification.find().sort({ createdAt: -1 }).limit(100).lean();
}
