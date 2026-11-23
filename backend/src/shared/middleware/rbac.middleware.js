import { ForbiddenError } from '../errors/AppError.js';
import { AdminRoleName } from '../enums/index.js';

export function hasPermission(admin, requiredPermissions = []) {
  if (!admin) return false;
  if (admin.roleName === AdminRoleName.SUPER_ADMIN) return true;
  const perms = new Set(admin.permissions || []);
  return requiredPermissions.every((p) => perms.has(p));
}

export function requirePermissions(...requiredPermissions) {
  return (req, _res, next) => {
    if (!hasPermission(req.admin, requiredPermissions)) {
      return next(
        new ForbiddenError(
          `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
          'INSUFFICIENT_PERMISSIONS'
        )
      );
    }
    return next();
  };
}
