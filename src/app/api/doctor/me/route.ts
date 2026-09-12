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
    const doctor = await Doctor.findById(authUser.userId).select('-passwordHash');

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 });
    }

    return NextResponse.json({ doctor });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
