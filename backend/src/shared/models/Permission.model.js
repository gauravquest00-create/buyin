import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    module: { type: String, required: true, trim: true },
    action: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
  },
  { timestamps: true, collection: 'permissions' }
);

export const Permission = mongoose.model('Permission', permissionSchema);
