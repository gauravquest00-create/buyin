import { Category } from '../../shared/models/Category.model.js';
import { recordAdminAudit } from '../_helpers/audit.helper.js';

export async function listCategories(type) {
  const filter = type ? { type } : {};
  return Category.find(filter).sort({ type: 1, sortOrder: 1, name: 1 }).lean();
}

export async function createCategory(payload, admin, ipAddress) {
  const category = await Category.create(payload);
  await recordAdminAudit({
    admin,
    action: 'CATEGORY_CREATED',
    module: 'category-management',
    targetType: 'Category',
    targetId: category._id,
    afterState: payload,
    ipAddress,
  });
  return category;
}

export async function toggleCategory(categoryId, isActive) {
  return Category.findByIdAndUpdate(categoryId, { $set: { isActive: Boolean(isActive) } }, { new: true });
}
