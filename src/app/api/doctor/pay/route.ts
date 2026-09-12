import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import Doctor from '@/lib/models/Doctor';
import Vendor from '@/lib/models/Vendor';
import Transaction from '@/lib/models/Transaction';
import { verifyAuthFromRequest } from '@/lib/auth';
import { z } from 'zod';

const PaySchema = z.object({
  vendorCode: z.string().min(1),
  amount: z.number().positive('Payment amount must be greater than 0'),
});

// GET endpoint to lookup vendor details by vendorCode before paying
export async function GET(req: NextRequest) {
  try {
    const authUser = verifyAuthFromRequest(req);
    if (!authUser || authUser.role !== 'doctor') {
      return NextResponse.json({ error: 'Unauthorized. Doctor access required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const vendorCode = searchParams.get('vendorCode');

    if (!vendorCode) {
      return NextResponse.json({ error: 'Vendor code is required' }, { status: 400 });
    }

    await connectToDatabase();
    const vendor = await Vendor.findOne({ vendorCode: vendorCode.trim() }).select('name vendorCode hospitalCluster category status');

    if (!vendor) {
      return NextResponse.json({ error: 'Invalid QR / Vendor not found' }, { status: 404 });
    }

    if (vendor.status === 'suspended') {
      return NextResponse.json({ error: 'This vendor outlet is currently suspended' }, { status: 403 });
    }

    return NextResponse.json({ vendor });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lookup failed' }, { status: 500 });
  }
}

// POST endpoint to process payment atomically
export async function POST(req: NextRequest) {
  try {
    const authUser = verifyAuthFromRequest(req);
    if (!authUser || authUser.role !== 'doctor') {
      return NextResponse.json({ error: 'Unauthorized. Doctor access required.' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();
    const parsed = PaySchema.parse(body);

    // Fetch Doctor and verify active status
    const doctor = await Doctor.findById(authUser.userId);
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor record not found' }, { status: 404 });
    }

    if (doctor.verificationStatus !== 'verified') {
      return NextResponse.json({ error: 'Your account is pending verification. Wallet disabled.' }, { status: 403 });
    }

    // Fetch Vendor
    const vendor = await Vendor.findOne({ vendorCode: parsed.vendorCode.trim() });
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor outlet not found' }, { status: 404 });
    }

    if (vendor.status === 'suspended') {
      return NextResponse.json({ error: 'Vendor outlet is currently suspended' }, { status: 403 });
    }

    if (doctor.walletBalance < parsed.amount) {
      return NextResponse.json(
        {
          error: `Insufficient wallet balance. Available: ₹${doctor.walletBalance}, Required: ₹${parsed.amount}`,
          walletBalance: doctor.walletBalance,
        },
        { status: 400 }
      );
    }

    doctor.walletBalance -= parsed.amount;
    const newDoctorBalance = doctor.walletBalance;

    vendor.collectedBalance = (vendor.collectedBalance || 0) + parsed.amount;
    const newVendorTotalBalance = vendor.collectedBalance + (vendor.toppedUpBalance || 0);

    const tx = new Transaction({
      type: 'doctor_payment',
      doctorId: doctor._id,
      vendorId: vendor._id,
      amount: parsed.amount,
      doctorBalanceAfter: newDoctorBalance,
      vendorBalanceAfter: newVendorTotalBalance,
      initiatedBy: 'doctor',
      status: 'success',
      notes: `Payment to ${vendor.name} (${vendor.vendorCode})`,
    });

    let session: mongoose.ClientSession | null = null;
    let transactionSuccess = false;

    try {
      session = await mongoose.startSession();
      session.startTransaction();

      await doctor.save({ session });
      await vendor.save({ session });
      await tx.save({ session });

      await session.commitTransaction();
      session.endSession();
      transactionSuccess = true;
    } catch {
      if (session) {
        try { await session.abortTransaction(); } catch {}
        try { session.endSession(); } catch {}
      }
    }

    // Standalone fallback
    if (!transactionSuccess) {
      await doctor.save();
      await vendor.save();
      await tx.save();
    }

    return NextResponse.json({
      success: true,
      message: `Paid ₹${parsed.amount} to ${vendor.name}`,
      payment: {
        vendorName: vendor.name,
        vendorCode: vendor.vendorCode,
        amountPaid: parsed.amount,
        remainingBalance: newDoctorBalance,
        transactionId: tx._id,
        timestamp: tx.createdAt,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || 'Invalid input' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Payment failed' }, { status: 500 });
  }
}
