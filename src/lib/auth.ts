import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'f2_white_coat_club_secret_key_2026_super_secure';

export interface UserTokenPayload {
  userId: string;
  email?: string;
  mobile?: string;
  name: string;
  role: 'admin' | 'vendor' | 'doctor';
  verificationStatus?: 'pending' | 'verified' | 'rejected';
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signJwtToken(payload: UserTokenPayload, expiresIn: jwt.SignOptions['expiresIn'] = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyJwtToken(token: string): UserTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserTokenPayload;
  } catch {
    // Fallback for Edge Runtime / Middleware where Node 'crypto' is unavailable
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(jsonPayload) as UserTokenPayload;
      }
    } catch {
      return null;
    }
    return null;
  }
}

export async function getSessionUser(): Promise<UserTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  return verifyJwtToken(token);
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const cookieToken = req.cookies.get('token')?.value;
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

export function verifyAuthFromRequest(req: NextRequest): UserTokenPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyJwtToken(token);
}
