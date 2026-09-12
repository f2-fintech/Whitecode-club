import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import MenuItem from '@/lib/models/MenuItem';
import Vendor from '@/lib/models/Vendor';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req, 'vendor');
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const vendorId = authResult.decoded.id;

    const menuItems = await MenuItem.find({ vendorId }).sort({ createdAt: -1 });

    return NextResponse.json({ menuItems }, { status: 200 });
  } catch (error: any) {
    console.error('Fetch menu error:', error);
    return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req, 'vendor');
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const vendorId = authResult.decoded.id;

    const body = await req.json();
    const { name, description, price, category, isAvailable } = body;

    if (!name || !price || !category) {
      return NextResponse.json({ error: 'Name, price, and category are required' }, { status: 400 });
    }

    const newItem = await MenuItem.create({
      name,
      description,
      price: Number(price),
      category,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      vendorId,
    });

    return NextResponse.json({ message: 'Menu item created', item: newItem }, { status: 201 });
  } catch (error: any) {
    console.error('Create menu item error:', error);
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
  }
}
