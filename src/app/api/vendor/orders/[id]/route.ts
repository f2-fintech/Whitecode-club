import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/lib/models/Order';
import { verifyAuth } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyAuth(req, 'vendor');
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const vendorId = authResult.decoded.id;
    const { id: orderId } = await params;

    const body = await req.json();
    const { status } = body;

    const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const order = await Order.findOne({ _id: orderId, vendorId });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    order.status = status;
    await order.save();

    return NextResponse.json({ message: 'Order status updated', order }, { status: 200 });
  } catch (error: any) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
