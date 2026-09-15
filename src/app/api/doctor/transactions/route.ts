import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Transaction from '@/lib/models/Transaction';
import Vendor from '@/lib/models/Vendor';
import { verifyAuthFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = verifyAuthFromRequest(req);
    if (!authUser || authUser.role !== 'doctor') {
      return NextResponse.json({ error: 'Unauthorized. Doctor login required.' }, { status: 401 });
    }

    await connectToDatabase();
    const transactions = await Transaction.find({ doctorId: authUser.userId })
      .sort({ createdAt: -1 })
      .populate({ path: 'vendorId', model: Vendor, select: 'name category hospitalCluster vendorCode' });

    return NextResponse.json({ transactions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
