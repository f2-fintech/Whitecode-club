import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Vendor from '@/lib/models/Vendor';
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
    
    // The phone number from Firebase contains country code e.g. +919876543210
    let mobile = decodedToken.phone_number;
    if (!mobile) {
      return NextResponse.json({ error: 'No phone number found in token' }, { status: 400 });
    }

    await connectToDatabase();
    
    // Try finding exact match or without +91
    let vendor = await Vendor.findOne({ mobile });
    if (!vendor && mobile.startsWith('+91')) {
      const mobileWithoutCode = mobile.replace('+91', '');
      vendor = await Vendor.findOne({ mobile: mobileWithoutCode });
    }

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor account not found with this mobile number' }, { status: 404 });
    }

    if (vendor.status === 'suspended') {
      return NextResponse.json({ error: 'Your vendor account is currently suspended. Contact admin.' }, { status: 403 });
    }

    // Generate our backend JWT token
    const token = signJwtToken({
      userId: vendor._id.toString(),
      mobile: vendor.mobile,
      name: vendor.name,
      role: 'vendor',
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: vendor._id,
        name: vendor.name,
        mobile: vendor.mobile,
        vendorCode: vendor.vendorCode,
        category: vendor.category,
        hospitalCluster: vendor.hospitalCluster,
        role: 'vendor',
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
    console.error('OTP Login Error:', error);
    return NextResponse.json({ error: error.message || 'OTP Login failed' }, { status: 500 });
  }
}
