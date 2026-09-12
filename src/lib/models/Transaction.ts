import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ITransaction extends Document {
  type: 'wallet_credit' | 'doctor_payment' | 'vendor_topup' | 'reversal';
  doctorId?: Types.ObjectId | null;
  vendorId?: Types.ObjectId | null;
  amount: number;
  doctorBalanceAfter?: number | null;
  vendorBalanceAfter?: number | null;
  initiatedBy: 'system' | 'doctor' | 'admin';
  adminId?: Types.ObjectId | null;
  status: 'success' | 'failed' | 'reversed';
  notes?: string;
  createdAt: Date;
}

const TransactionSchema: Schema<ITransaction> = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['wallet_credit', 'doctor_payment', 'vendor_topup', 'reversal'],
    },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', default: null },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', default: null },
    amount: { type: Number, required: true },
    doctorBalanceAfter: { type: Number, default: null },
    vendorBalanceAfter: { type: Number, default: null },
    initiatedBy: {
      type: String,
      required: true,
      enum: ['system', 'doctor', 'admin'],
    },
    adminId: { type: Schema.Types.ObjectId, ref: 'Admin', default: null },
    status: {
      type: String,
      required: true,
      enum: ['success', 'failed', 'reversed'],
      default: 'success',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
