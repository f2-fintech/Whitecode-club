import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import MenuItem from '@/lib/models/MenuItem';
import { verifyAuth } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyAuth(req, 'vendor');
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const vendorId = authResult.decoded.id;
    const { id: itemId } = await params;

    const body = await req.json();
    
    // Ensure item belongs to vendor
    const item = await MenuItem.findOne({ _id: itemId, vendorId });
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    if (body.name) item.name = body.name;
    if (body.description !== undefined) item.description = body.description;
    if (body.price !== undefined) item.price = Number(body.price);
    if (body.category) item.category = body.category;
    if (body.isAvailable !== undefined) item.isAvailable = body.isAvailable;

    await item.save();

    return NextResponse.json({ message: 'Menu item updated', item }, { status: 200 });
  } catch (error: any) {
    console.error('Update menu item error:', error);
    return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyAuth(req, 'vendor');
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const vendorId = authResult.decoded.id;
    const { id: itemId } = await params;

    const item = await MenuItem.findOneAndDelete({ _id: itemId, vendorId });
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Menu item deleted' }, { status: 200 });
  } catch (error: any) {
    console.error('Delete menu item error:', error);
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
  }
}
