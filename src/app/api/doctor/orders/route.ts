import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import Doctor from '@/lib/models/Doctor';
import Vendor from '@/lib/models/Vendor';
import MenuItem from '@/lib/models/MenuItem';
import Order from '@/lib/models/Order';
import Transaction from '@/lib/models/Transaction';
import { verifyAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req, 'doctor');
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const doctorId = authResult.decoded.id;

    const body = await req.json();
    const { vendorId, items } = body; // items: [{ menuItemId, quantity }]

    if (!vendorId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid order data' }, { status: 400 });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const doctor = await Doctor.findById(doctorId).session(session);
      const vendor = await Vendor.findById(vendorId).session(session);

      if (!doctor || !vendor) {
        throw new Error('Doctor or Vendor not found');
      }

      if (doctor.verificationStatus !== 'verified') {
        throw new Error('Doctor account is not verified yet');
      }

      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const menuItem = await MenuItem.findById(item.menuItemId).session(session);
        if (!menuItem || menuItem.vendorId.toString() !== vendorId) {
          throw new Error(`Invalid menu item: ${item.menuItemId}`);
        }
        if (!menuItem.isAvailable) {
          throw new Error(`Item not available: ${menuItem.name}`);
        }

        const itemTotal = menuItem.price * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          menuItemId: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: item.quantity,
        });
      }

      if (doctor.walletBalance < totalAmount) {
        throw new Error('Insufficient wallet balance');
      }

      // Deduct from doctor
      doctor.walletBalance -= totalAmount;
      await doctor.save({ session });

      // Add to vendor
      vendor.collectedBalance += totalAmount;
      await vendor.save({ session });

      // Create Order
      const newOrder = await Order.create([{
        doctorId,
        vendorId,
        items: orderItems,
        totalAmount,
        status: 'pending',
        orderType: 'pre-order',
      }], { session });

      // Create Transaction
      await Transaction.create([{
        type: 'order_payment',
        doctorId,
        vendorId,
        orderId: newOrder[0]._id,
        amount: totalAmount,
        doctorBalanceAfter: doctor.walletBalance,
        vendorBalanceAfter: vendor.collectedBalance,
      }], { session });

      await session.commitTransaction();
      session.endSession();

      return NextResponse.json({ message: 'Order placed successfully', orderId: newOrder[0]._id }, { status: 201 });
    } catch (txError: any) {
      await session.abortTransaction();
      session.endSession();
      console.error('Order transaction error:', txError);
      return NextResponse.json({ error: txError.message || 'Payment failed' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Order API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
