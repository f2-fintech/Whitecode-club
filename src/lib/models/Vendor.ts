import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IVendor extends Document {
  name: string;
  hospitalCluster: string;
  category: 'canteen' | 'food-court' | 'pharmacy' | 'beverage' | 'snacks' | 'other';
  mobile: string;
  passwordHash: string;
  vendorCode: string;
  qrPayload: string;
  toppedUpBalance: number;
  collectedBalance: number;
  status: 'active' | 'suspended';
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const VendorSchema: Schema<IVendor> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    hospitalCluster: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['canteen', 'food-court', 'pharmacy', 'beverage', 'snacks', 'other'],
      default: 'canteen',
    },
    mobile: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    vendorCode: { type: String, required: true, unique: true, index: true },
    qrPayload: { type: String, required: true },
    toppedUpBalance: { type: Number, default: 0 },
    collectedBalance: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  },
  { timestamps: true }
);

const Vendor: Model<IVendor> = mongoose.models.Vendor || mongoose.model<IVendor>('Vendor', VendorSchema);

export default Vendor;
