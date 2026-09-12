import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Vendor from '@/lib/models/Vendor';
import { hashPassword, verifyAuthFromRequest } from '@/lib/auth';
import { z } from 'zod';

const CreateVendorSchema = z.object({
  name: z.string().min(2),
  hospitalCluster: z.string().min(2),
  category: z.enum(['canteen', 'food-court', 'pharmacy', 'beverage', 'snacks', 'other']),
  mobile: z.string().min(10).max(15),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const authUser = verifyAuthFromRequest(req);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();
    const parsed = CreateVendorSchema.parse(body);

    const existingVendor = await Vendor.findOne({ mobile: parsed.mobile.trim() });
    if (existingVendor) {
      return NextResponse.json({ error: 'A vendor with this mobile number already exists' }, { status: 400 });
    }

    // Generate unique vendorCode
    let vendorCode = '';
    let isUnique = false;
    while (!isUnique) {
      const randomId = Math.floor(100000 + Math.random() * 900000);
      vendorCode = `F2-VEND-${randomId}`;
      const found = await Vendor.findOne({ vendorCode });
      if (!found) isUnique = true;
    }

    const qrPayload = JSON.stringify({
      vendorCode,
      name: parsed.name.trim(),
      category: parsed.category,
    });

    const passwordHash = await hashPassword(parsed.password);

    const vendor = await Vendor.create({
      name: parsed.name.trim(),
      hospitalCluster: parsed.hospitalCluster.trim(),
      category: parsed.category,
      mobile: parsed.mobile.trim(),
      passwordHash,
      vendorCode,
      qrPayload,
      toppedUpBalance: 0,
      collectedBalance: 0,
      status: 'active',
      createdBy: authUser.userId,
    });

    return NextResponse.json(
      {
        message: 'Vendor created successfully',
        vendor: {
          id: vendor._id,
          name: vendor.name,
          vendorCode: vendor.vendorCode,
          hospitalCluster: vendor.hospitalCluster,
          category: vendor.category,
          mobile: vendor.mobile,
          qrPayload: vendor.qrPayload,
          status: vendor.status,
          toppedUpBalance: vendor.toppedUpBalance,
          collectedBalance: vendor.collectedBalance,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || 'Validation error' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to create vendor' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const authUser = verifyAuthFromRequest(req);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    await connectToDatabase();
    const vendors = await Vendor.find().sort({ createdAt: -1 });

    return NextResponse.json({ vendors });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch vendors' }, { status: 500 });
  }
}
