import { Role } from '../../shared/models/Role.model.js';
import { Permission } from '../../shared/models/Permission.model.js';
import { recordAdminAudit } from '../_helpers/audit.helper.js';

export async function listRolesAndPermissions() {
  const [roles, permissions] = await Promise.all([
    Role.find().sort({ name: 1 }).lean(),
    Permission.find().sort({ module: 1, action: 1 }).lean(),
  ]);
  return { roles, permissions };
}

export async function createRole(payload, admin, ipAddress) {
  const role = await Role.create(payload);
  await recordAdminAudit({
    admin,
    action: 'ROLE_CREATED',
    module: 'roles-permissions',
    targetType: 'Role',
    targetId: role._id,
    afterState: payload,
    ipAddress,
  });
  return role;
}

export async function updateRole(roleId, payload, admin, ipAddress) {
  const role = await Role.findByIdAndUpdate(roleId, { $set: payload }, { new: true });
  await recordAdminAudit({
    admin,
    action: 'ROLE_UPDATED',
    module: 'roles-permissions',
    targetType: 'Role',
    targetId: roleId,
    afterState: payload,
    ipAddress,
  });
  return role;
}
