import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import Vendor from '@/lib/models/Vendor';
import Transaction from '@/lib/models/Transaction';
import { verifyAuthFromRequest } from '@/lib/auth';
import { z } from 'zod';

const TopupSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  notes: z.string().optional().default('Cash settlement top-up'),
});

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

    const body = await req.json();
    const parsed = TopupSchema.parse(body);

    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    vendor.toppedUpBalance = (vendor.toppedUpBalance || 0) + parsed.amount;
    const totalBalanceAfter = vendor.toppedUpBalance + vendor.collectedBalance;

    const tx = new Transaction({
      type: 'vendor_topup',
      vendorId: vendor._id,
      amount: parsed.amount,
      vendorBalanceAfter: totalBalanceAfter,
      initiatedBy: 'admin',
      adminId: authUser.userId,
      status: 'success',
      notes: parsed.notes,
    });

    let session: mongoose.ClientSession | null = null;
    let transactionSuccess = false;

    try {
      session = await mongoose.startSession();
      session.startTransaction();

      await tx.save({ session });
      await vendor.save({ session });

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
      await tx.save();
      await vendor.save();
    }

    return NextResponse.json({
      message: `Successfully topped up ₹${parsed.amount} for ${vendor.name}`,
      vendor: {
        id: vendor._id,
        name: vendor.name,
        toppedUpBalance: vendor.toppedUpBalance,
        collectedBalance: vendor.collectedBalance,
        totalBalance: totalBalanceAfter,
      },
      transaction: tx,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || 'Invalid input' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Top-up failed' }, { status: 500 });
  }
}
