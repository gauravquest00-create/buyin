import env from '../../config/environment.js';
import { Admin } from '../models/Admin.model.js';
import { Role } from '../models/Role.model.js';
import { Permission } from '../models/Permission.model.js';
import { RechargePackage } from '../models/RechargePackage.model.js';
import { PricingRule } from '../models/PricingRule.model.js';
import { SystemSetting } from '../models/SystemSetting.model.js';
import { Category } from '../models/Category.model.js';
import {
  ALL_PERMISSIONS,
  DEFAULT_PRICING_CONFIG,
  DEFAULT_RECHARGE_PACKAGES,
  DEFAULT_ROLE_PERMISSIONS,
  BUSINESS_RULES,
} from '../constants/index.js';
import { AdminRoleName, PropertyType } from '../enums/index.js';
import { hashPassword } from '../utils/crypto.js';
import { logger } from '../utils/logger.js';

export async function runBootstrap() {
  // 1. Seed Permissions
  for (const key of ALL_PERMISSIONS) {
    const [module, action] = key.split(':');
    await Permission.updateOne(
      { key },
      { $setOnInsert: { key, module, action, description: `${action} access on ${module}` } },
      { upsert: true }
    );
  }

  // 2. Seed Roles
  let superAdminRole = null;
  for (const [roleName, permissions] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    const role = await Role.findOneAndUpdate(
      { name: roleName },
      {
        $setOnInsert: {
          name: roleName,
          description: `Built-in ${roleName} role`,
          permissions,
          isSystemRole: true,
        },
      },
      { upsert: true, new: true }
    );
    if (roleName === AdminRoleName.SUPER_ADMIN) superAdminRole = role;
  }

  // 3. Initial Super Admin Bootstrap (only when NO bootstrap admin exists; never resets existing password!)
  const existingBootstrap = await Admin.findOne({ isBootstrapAdmin: true });
  if (!existingBootstrap && env.ADMIN_EMAIL && env.ADMIN_PASSWORD && superAdminRole) {
    const passwordHash = await hashPassword(env.ADMIN_PASSWORD);
    await Admin.create({
      fullName: 'BUYIN Super Administrator',
      email: env.ADMIN_EMAIL.toLowerCase(),
      passwordHash,
      roleId: superAdminRole._id,
      isActive: true,
      isBootstrapAdmin: true,
      mustChangePassword: env.isProduction,
      mfaEnabled: false,
    });
    logger.info('Initial Super Admin bootstrapped from environment', { email: env.ADMIN_EMAIL });
  }

  // 4. Default Recharge Packages
  for (const pkg of DEFAULT_RECHARGE_PACKAGES) {
    await RechargePackage.updateOne({ code: pkg.code }, { $setOnInsert: pkg }, { upsert: true });
  }

  // 5. Default Pricing Rule v1
  const existingPricing = await PricingRule.findOne({ isActive: true });
  if (!existingPricing) {
    await PricingRule.create({
      version: 1,
      isActive: true,
      ...DEFAULT_PRICING_CONFIG,
      changeNotes: 'Initial BUYIN configurable pricing engine defaults',
    });
  }

  // 6. Default System Settings
  const defaultSettings = [
    { key: 'ownership_days', value: BUSINESS_RULES.OWNERSHIP_DAYS, category: 'CLAIMS', description: 'Default lead ownership validity in days' },
    { key: 'extension_days', value: BUSINESS_RULES.EXTENSION_DAYS, category: 'CLAIMS', description: 'Additional days granted on ownership extension' },
    { key: 'extension_cost_ratio', value: BUSINESS_RULES.EXTENSION_COST_RATIO, category: 'CLAIMS', description: 'Fraction of original claim points charged for extension' },
    { key: 'refund_deduction_percent', value: 5, category: 'REFUNDS', description: 'Deduction percentage applied to approved refunds' },
    { key: 'allow_pending_user_browsing', value: true, category: 'USERS', description: 'Allow pending-verification users limited masked lead pool browsing' },
    { key: 'maintenance_mode', value: false, category: 'EMERGENCY', description: 'Emergency maintenance lock for non-admin traffic' },
    { key: 'claiming_paused', value: false, category: 'EMERGENCY', description: 'Emergency pause on new lead claims' },
  ];
  for (const setting of defaultSettings) {
    await SystemSetting.updateOne({ key: setting.key }, { $setOnInsert: setting }, { upsert: true });
  }

  // 7. Default Property Type Categories
  for (const [idx, prop] of Object.values(PropertyType).entries()) {
    await Category.updateOne(
      { type: 'PROPERTY_TYPE', name: prop, parentName: '' },
      { $setOnInsert: { type: 'PROPERTY_TYPE', name: prop, parentName: '', sortOrder: idx + 1 } },
      { upsert: true }
    );
  }
}
