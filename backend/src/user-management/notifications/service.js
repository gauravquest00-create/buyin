import { Notification } from '../../shared/models/Notification.model.js';

export async function listNotifications(userId) {
  const [items, unreadCount] = await Promise.all([
    Notification.find({ recipientType: 'USER', recipientId: userId }).sort({ createdAt: -1 }).limit(50).lean(),
    Notification.countDocuments({ recipientType: 'USER', recipientId: userId, isRead: false }),
  ]);
  return { notifications: items, unreadCount };
}

export async function markRead(userId, notificationId) {
  return Notification.findOneAndUpdate(
    { _id: notificationId, recipientType: 'USER', recipientId: userId },
    { $set: { isRead: true, readAt: new Date() } },
    { new: true }
  );
}

export async function markAllRead(userId) {
  await Notification.updateMany(
    { recipientType: 'USER', recipientId: userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
}
