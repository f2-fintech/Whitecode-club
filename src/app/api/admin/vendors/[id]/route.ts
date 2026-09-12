import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Vendor from '@/lib/models/Vendor';
import { verifyAuthFromRequest } from '@/lib/auth';
import { z } from 'zod';

const PatchVendorSchema = z.object({
  status: z.enum(['active', 'suspended']).optional(),
  hospitalCluster: z.string().optional(),
  category: z.enum(['canteen', 'food-court', 'pharmacy', 'beverage', 'snacks', 'other']).optional(),
});

export async function GET(
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

    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json({ vendor });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch vendor' }, { status: 500 });
  }
}

export async function PATCH(
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
    const body = await req.json();
    const parsed = PatchVendorSchema.parse(body);

    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    if (parsed.status) vendor.status = parsed.status;
    if (parsed.hospitalCluster) vendor.hospitalCluster = parsed.hospitalCluster;
    if (parsed.category) vendor.category = parsed.category;

    await vendor.save();

    return NextResponse.json({
      message: 'Vendor updated successfully',
      vendor,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Update failed' }, { status: 500 });
  }
}
