import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/auth';

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Public paths
  if (
    path === '/' ||
    path === '/admin/login' ||
    path === '/vendor/login' ||
    path === '/doctor/login' ||
    path === '/doctor/signup' ||
    path.startsWith('/api/auth/') ||
    path.startsWith('/api/seed') ||
    path.startsWith('/_next') ||
    path.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get('token')?.value;
  const user = token ? verifyJwtToken(token) : null;

  // Admin routes
  if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
    if (!user || user.role !== 'admin') {
      if (path.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  // Vendor routes
  if (path.startsWith('/vendor') || path.startsWith('/api/vendor')) {
    if (!user || user.role !== 'vendor') {
      if (path.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized vendor access' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/vendor/login', req.url));
    }
  }

  // Doctor routes
  if (path.startsWith('/doctor') || path.startsWith('/api/doctor')) {
    if (!user || user.role !== 'doctor') {
      if (path.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized doctor access' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/doctor/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/vendor/:path*', '/doctor/:path*', '/api/admin/:path*', '/api/vendor/:path*', '/api/doctor/:path*'],
};
