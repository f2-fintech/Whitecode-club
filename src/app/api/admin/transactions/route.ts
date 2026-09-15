import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Transaction from '@/lib/models/Transaction';
import Doctor from '@/lib/models/Doctor';
import Vendor from '@/lib/models/Vendor';
import Admin from '@/lib/models/Admin';
import { verifyAuthFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = verifyAuthFromRequest(req);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const type = searchParams.get('type');
    const doctorId = searchParams.get('doctorId');
    const vendorId = searchParams.get('vendorId');

    const query: any = {};

    if (type) query.type = type;
    if (doctorId) query.doctorId = doctorId;
    if (vendorId) query.vendorId = vendorId;

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .populate({ path: 'doctorId', model: Doctor, select: 'name mobile registrationNumber' })
      .populate({ path: 'vendorId', model: Vendor, select: 'name vendorCode category hospitalCluster' })
      .populate({ path: 'adminId', model: Admin, select: 'name email' });

    return NextResponse.json({ transactions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch transactions' }, { status: 500 });
  }
}
