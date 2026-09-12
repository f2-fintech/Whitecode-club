import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Vendor from '@/lib/models/Vendor';
import { verifyAuthFromRequest } from '@/lib/auth';
import QRCode from 'qrcode';

export async function GET(req: NextRequest) {
  try {
    const authUser = verifyAuthFromRequest(req);
    if (!authUser || authUser.role !== 'vendor') {
      return NextResponse.json({ error: 'Unauthorized. Vendor access required.' }, { status: 401 });
    }

    await connectToDatabase();
    const vendor = await Vendor.findById(authUser.userId);

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    // Generate Base64 Data URL for the QR code
    const qrDataUrl = await QRCode.toDataURL(vendor.vendorCode, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1e1b4b',
        light: '#ffffff',
      },
    });

    return NextResponse.json({
      vendorCode: vendor.vendorCode,
      vendorName: vendor.name,
      category: vendor.category,
      hospitalCluster: vendor.hospitalCluster,
      qrPayload: vendor.qrPayload,
      qrDataUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'QR generation failed' }, { status: 500 });
  }
}
