import { SystemSetting } from '../../shared/models/SystemSetting.model.js';
import { recordAdminAudit } from '../_helpers/audit.helper.js';

export async function listSettings() {
  return SystemSetting.find().sort({ category: 1, key: 1 }).lean();
}

export async function upsertSetting({ key, value, description }, admin, ipAddress) {
  const prev = await SystemSetting.findOne({ key }).lean();
  const setting = await SystemSetting.findOneAndUpdate(
    { key },
    { $set: { value, ...(description ? { description } : {}), updatedByAdminId: admin._id } },
    { upsert: true, new: true }
  );
  await recordAdminAudit({
    admin,
    action: 'SYSTEM_SETTING_UPDATED',
    module: 'system-settings',
    targetType: 'SystemSetting',
    targetId: key,
    beforeState: { value: prev?.value },
    afterState: { value },
    ipAddress,
  });
  return setting;
}
