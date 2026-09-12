import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import Doctor from '@/lib/models/Doctor';
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

    doctor.verificationStatus = 'rejected';
    doctor.verifiedBy = new mongoose.Types.ObjectId(authUser.userId);
    doctor.verifiedAt = new Date();
    await doctor.save();

    return NextResponse.json({
      message: 'Doctor account rejected.',
      doctor: {
        id: doctor._id,
        name: doctor.name,
        verificationStatus: doctor.verificationStatus,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Rejection failed' }, { status: 500 });
  }
}
