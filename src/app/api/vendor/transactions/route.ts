import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Transaction from '@/lib/models/Transaction';
import { verifyAuthFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = verifyAuthFromRequest(req);
    if (!authUser || authUser.role !== 'vendor') {
      return NextResponse.json({ error: 'Unauthorized. Vendor access required.' }, { status: 401 });
    }

    await connectToDatabase();
    const transactions = await Transaction.find({ vendorId: authUser.userId })
      .sort({ createdAt: -1 })
      .populate('doctorId', 'name mobile registrationNumber');

    return NextResponse.json({ transactions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
