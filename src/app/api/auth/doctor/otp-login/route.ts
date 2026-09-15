import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Doctor from '@/lib/models/Doctor';
import { signJwtToken } from '@/lib/auth';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: 'Missing ID token' }, { status: 400 });
    }

    // Verify the Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    let mobile = decodedToken.phone_number;
    if (!mobile) {
      return NextResponse.json({ error: 'No phone number found in token' }, { status: 400 });
    }

    await connectToDatabase();
    
    let doctor = await Doctor.findOne({ mobile });
    if (!doctor && mobile.startsWith('+91')) {
      const mobileWithoutCode = mobile.replace('+91', '');
      doctor = await Doctor.findOne({ mobile: mobileWithoutCode });
    }

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor account not found with this mobile number' }, { status: 404 });
    }

    if (doctor.verificationStatus === 'pending') {
      return NextResponse.json({ 
        error: 'Verification Pending. Your medical registration is currently under review by Admin. Wallet access will be enabled once verified.',
        pending: true 
      }, { status: 403 });
    }

    if (doctor.verificationStatus === 'rejected') {
      return NextResponse.json({ error: 'Your doctor account verification was rejected. Contact admin.' }, { status: 403 });
    }

    // Generate our backend JWT token
    const token = signJwtToken({
      userId: doctor._id.toString(),
      mobile: doctor.mobile,
      name: doctor.name,
      role: 'doctor',
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: doctor._id,
        name: doctor.name,
        mobile: doctor.mobile,
        registrationNumber: doctor.registrationNumber,
        walletBalance: doctor.walletBalance,
        verificationStatus: doctor.verificationStatus,
        role: 'doctor',
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Doctor OTP Login Error:', error);
    return NextResponse.json({ error: error.message || 'OTP Login failed' }, { status: 500 });
  }
}
