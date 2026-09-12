import { NextResponse } from 'next/server';
import { seedAdmin } from '@/lib/seed';

export async function POST() {
  try {
    await seedAdmin();
    return NextResponse.json({ message: 'Admin seeded successfully (admin@f2whitecoat.com / AdminPass123!)' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Seeding failed' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await seedAdmin();
    return NextResponse.json({ message: 'Admin seeded successfully (admin@f2whitecoat.com / AdminPass123!)' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Seeding failed' }, { status: 500 });
  }
}
