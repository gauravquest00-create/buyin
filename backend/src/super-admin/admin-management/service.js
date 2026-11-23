import { Admin } from '../../shared/models/Admin.model.js';
import { hashPassword } from '../../shared/utils/crypto.js';
import { ConflictError, NotFoundError } from '../../shared/errors/AppError.js';
import { recordAdminAudit } from '../_helpers/audit.helper.js';

export async function listAdmins() {
  return Admin.find().select('-passwordHash -mfaSecret').populate('roleId', 'name permissions').sort({ createdAt: -1 }).lean();
}

export async function createAdmin(payload, actor, ipAddress) {
  const exists = await Admin.findOne({ email: payload.email.toLowerCase() });
  if (exists) throw new ConflictError('Administrator with this email already exists');
  const passwordHash = await hashPassword(payload.password);
  const created = await Admin.create({
    fullName: payload.fullName,
    email: payload.email.toLowerCase(),
    passwordHash,
    roleId: payload.roleId,
    customPermissions: payload.customPermissions || [],
    mustChangePassword: true,
  });
  await recordAdminAudit({
    admin: actor,
    action: 'ADMIN_CREATED',
    module: 'admin-management',
    targetType: 'Admin',
    targetId: created._id,
    afterState: { email: created.email, roleId: created.roleId },
    ipAddress,
  });
  return Admin.findById(created._id).select('-passwordHash -mfaSecret').populate('roleId', 'name').lean();
}

export async function updateAdmin(adminId, updates, actor, ipAddress) {
  const updated = await Admin.findByIdAndUpdate(adminId, { $set: updates }, { new: true })
    .select('-passwordHash -mfaSecret')
    .populate('roleId', 'name');
  if (!updated) throw new NotFoundError('Administrator not found');
  await recordAdminAudit({
    admin: actor,
    action: 'ADMIN_UPDATED',
    module: 'admin-management',
    targetType: 'Admin',
    targetId: adminId,
    afterState: updates,
    ipAddress,
  });
  return updated;
}
