import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Doctor from '@/lib/models/Doctor';
import { comparePassword, signJwtToken } from '@/lib/auth';
import { z } from 'zod';

const DoctorLoginSchema = z.object({
  mobile: z.string().min(10),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const parsed = DoctorLoginSchema.parse(body);

    const doctor = await Doctor.findOne({ mobile: parsed.mobile.trim() });
    if (!doctor) {
      return NextResponse.json({ error: 'Invalid mobile or password' }, { status: 401 });
    }

    const isValid = await comparePassword(parsed.password, doctor.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid mobile or password' }, { status: 401 });
    }

    const token = signJwtToken({
      userId: doctor._id.toString(),
      mobile: doctor.mobile,
      name: doctor.name,
      role: 'doctor',
      verificationStatus: doctor.verificationStatus,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: doctor._id,
        name: doctor.name,
        mobile: doctor.mobile,
        verificationStatus: doctor.verificationStatus,
        walletBalance: doctor.walletBalance,
        role: 'doctor',
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input format' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
