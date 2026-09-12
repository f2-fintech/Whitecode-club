import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Vendor from '@/lib/models/Vendor';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req, 'doctor');
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Fetch active vendors
    const vendors = await Vendor.find({ status: 'active' })
      .select('name category hospitalCluster _id')
      .sort({ name: 1 });

    return NextResponse.json({ vendors }, { status: 200 });
  } catch (error: any) {
    console.error('Fetch vendors error:', error);
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}
