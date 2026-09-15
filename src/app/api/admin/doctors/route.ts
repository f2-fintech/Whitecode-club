import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Doctor from '@/lib/models/Doctor';
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
    const status = searchParams.get('status');

    const query: any = {};
    if (status && ['pending', 'verified', 'rejected'].includes(status)) {
      query.verificationStatus = status;
    }

    const doctors = await Doctor.find(query)
      .sort({ createdAt: -1 })
      .populate({ path: 'verifiedBy', model: Admin, select: 'name email' });

    return NextResponse.json({ doctors });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch doctors' }, { status: 500 });
  }
}
