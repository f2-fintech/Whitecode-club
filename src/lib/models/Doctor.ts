import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IDoctor extends Document {
  name: string;
  mobile: string;
  passwordHash: string;
  registrationNumber: string;
  council: string;
  state: string;
  college: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedBy?: Types.ObjectId | null;
  verifiedAt?: Date | null;
  walletBalance: number;
  walletCreditedOnce: boolean;
  consentGiven: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema: Schema<IDoctor> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, unique: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    registrationNumber: { type: String, required: true, trim: true },
    council: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    college: { type: String, required: true, trim: true },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'Admin', default: null },
    verifiedAt: { type: Date, default: null },
    walletBalance: { type: Number, default: 0 },
    walletCreditedOnce: { type: Boolean, default: false },
    consentGiven: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

const Doctor: Model<IDoctor> = mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', DoctorSchema);

export default Doctor;
