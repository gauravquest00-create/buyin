import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['CITY', 'LOCATION', 'PROPERTY_TYPE', 'CONFIGURATION'], required: true, index: true },
    name: { type: String, required: true, trim: true },
    parentName: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'categories' }
);

categorySchema.index({ type: 1, name: 1, parentName: 1 }, { unique: true });
export const Category = mongoose.model('Category', categorySchema);
