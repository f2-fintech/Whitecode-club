import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Doctor from '@/lib/models/Doctor';
import { verifyAuthFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = verifyAuthFromRequest(req);
    if (!authUser || authUser.role !== 'doctor') {
      return NextResponse.json({ error: 'Unauthorized. Doctor login required.' }, { status: 401 });
    }

    await connectToDatabase();
    const doctor = await Doctor.findById(authUser.userId).select('walletBalance verificationStatus walletCreditedOnce name mobile');

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    return NextResponse.json({
      walletBalance: doctor.walletBalance,
      verificationStatus: doctor.verificationStatus,
      walletCreditedOnce: doctor.walletCreditedOnce,
      doctorName: doctor.name,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
