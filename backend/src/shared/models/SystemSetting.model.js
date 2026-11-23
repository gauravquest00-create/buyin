import mongoose from 'mongoose';

const systemSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    category: { type: String, default: 'GENERAL' },
    description: { type: String, default: '' },
    updatedByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  },
  { timestamps: true, collection: 'system_settings' }
);

export const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema);
