import { AuditLog } from '../../shared/models/AuditLog.model.js';

export async function recordAdminAudit({ admin, action, module, targetType = '', targetId = '', reason = '', beforeState = null, afterState = null, ipAddress = '' }) {
  return AuditLog.create({
    actorType: 'ADMIN',
    actorId: admin?._id || null,
    actorEmail: admin?.email || '',
    action,
    module,
    targetType,
    targetId: targetId ? String(targetId) : '',
    reason,
    beforeState,
    afterState,
    ipAddress,
  });
}
