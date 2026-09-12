import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import MenuItem from '@/lib/models/MenuItem';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyAuth(req, 'doctor');
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const vendorId = params.id;

    // Fetch active menu items for this vendor
    const menuItems = await MenuItem.find({ vendorId, isAvailable: true }).sort({ category: 1, name: 1 });

    return NextResponse.json({ menuItems }, { status: 200 });
  } catch (error: any) {
    console.error('Fetch vendor menu error:', error);
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
  }
}
