import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/lib/models/Order';
import Doctor from '@/lib/models/Doctor';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req, 'vendor');
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const vendorId = authResult.decoded.id;

    // Fetch active/today's orders for vendor
    // We populate doctor info to show the name
    const orders = await Order.find({ vendorId })
      .populate({ path: 'doctorId', model: Doctor, select: 'name mobile' })
      .sort({ createdAt: -1 })
      .limit(50); // limit for now

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error: any) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
