import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Doctor from '@/lib/models/Doctor';
import { hashPassword } from '@/lib/auth';
import { z } from 'zod';

const DoctorSignupSchema = z.object({
  name: z.string().min(2),
  mobile: z.string().min(10).max(15),
  password: z.string().min(6),
  registrationNumber: z.string().min(3),
  council: z.string().min(2),
  state: z.string().min(2),
  college: z.string().min(2),
  consentGiven: z.boolean().refine((v) => v === true, 'Consent is required'),
});

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const parsed = DoctorSignupSchema.parse(body);

    const existingDoctor = await Doctor.findOne({ mobile: parsed.mobile.trim() });
    if (existingDoctor) {
      return NextResponse.json({ error: 'A doctor account with this mobile number already exists' }, { status: 400 });
    }

    const passwordHash = await hashPassword(parsed.password);

    const doctor = await Doctor.create({
      name: parsed.name.trim(),
      mobile: parsed.mobile.trim(),
      passwordHash,
      registrationNumber: parsed.registrationNumber.trim(),
      council: parsed.council.trim(),
      state: parsed.state.trim(),
      college: parsed.college.trim(),
      verificationStatus: 'pending',
      walletBalance: 0,
      walletCreditedOnce: false,
      consentGiven: parsed.consentGiven,
    });

    return NextResponse.json(
      {
        message: 'Account created successfully. Verification is pending approval by Admin.',
        doctor: {
          id: doctor._id,
          name: doctor.name,
          mobile: doctor.mobile,
          verificationStatus: doctor.verificationStatus,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || 'Validation failed' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Signup failed' }, { status: 500 });
  }
}
