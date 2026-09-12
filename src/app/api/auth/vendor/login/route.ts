import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Vendor from '@/lib/models/Vendor';
import { comparePassword, signJwtToken } from '@/lib/auth';
import { z } from 'zod';

const VendorLoginSchema = z.object({
  mobile: z.string().min(10),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const parsed = VendorLoginSchema.parse(body);

    const vendor = await Vendor.findOne({ mobile: parsed.mobile.trim() });
    if (!vendor) {
      return NextResponse.json({ error: 'Invalid mobile or password' }, { status: 401 });
    }

    if (vendor.status === 'suspended') {
      return NextResponse.json({ error: 'Your vendor account is currently suspended. Contact admin.' }, { status: 403 });
    }

    const isValid = await comparePassword(parsed.password, vendor.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid mobile or password' }, { status: 401 });
    }

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
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid mobile or password format' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
