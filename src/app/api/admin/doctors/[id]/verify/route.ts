import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import Doctor from '@/lib/models/Doctor';
import Transaction from '@/lib/models/Transaction';
import { verifyAuthFromRequest } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = verifyAuthFromRequest(req);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { id } = await params;
    await connectToDatabase();

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    if (doctor.verificationStatus === 'verified') {
      return NextResponse.json({ error: 'Doctor is already verified' }, { status: 400 });
    }

    doctor.verificationStatus = 'verified';
    doctor.verifiedBy = new mongoose.Types.ObjectId(authUser.userId);
    doctor.verifiedAt = new Date();

    let createdTx = null;

    if (!doctor.walletCreditedOnce) {
      doctor.walletBalance = 500;
      doctor.walletCreditedOnce = true;

      createdTx = new Transaction({
        type: 'wallet_credit',
        doctorId: doctor._id,
        amount: 500,
        doctorBalanceAfter: 500,
        initiatedBy: 'admin',
        adminId: authUser.userId,
        status: 'success',
        notes: 'Initial ₹500 welcome wallet credit upon verification',
      });
    }

    // Try Session Transaction if MongoDB supports it (Replica Set / Atlas), otherwise fallback to direct save
    let session: mongoose.ClientSession | null = null;
    let transactionSuccess = false;

    try {
      session = await mongoose.startSession();
      session.startTransaction();

      if (createdTx) {
        await createdTx.save({ session });
      }
      await doctor.save({ session });

      await session.commitTransaction();
      session.endSession();
      transactionSuccess = true;
    } catch {
      if (session) {
        try { await session.abortTransaction(); } catch {}
        try { session.endSession(); } catch {}
      }
    }

    // Fallback for standalone MongoDB deployment without replica set
    if (!transactionSuccess) {
      if (createdTx) {
        await createdTx.save();
      }
      await doctor.save();
    }

    return NextResponse.json({
      message: 'Doctor verified successfully. ₹500 wallet credit assigned.',
      doctor: {
        id: doctor._id,
        name: doctor.name,
        verificationStatus: doctor.verificationStatus,
        walletBalance: doctor.walletBalance,
      },
      transaction: createdTx,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
  }
}
