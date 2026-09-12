'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldCheck, LogOut, Store, Award, UserCheck } from 'lucide-react';

interface NavbarProps {
  userRole?: 'admin' | 'vendor' | 'doctor';
  userName?: string;
}

export default function Navbar({ userRole, userName }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push(userRole === 'admin' ? '/admin/login' : userRole === 'vendor' ? '/vendor/login' : '/doctor/login');
  };

  const getRoleBadge = () => {
    switch (userRole) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin
          </span>
        );
      case 'vendor':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Store className="w-3.5 h-3.5" />
            Vendor Outlet
          </span>
        );
      case 'doctor':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            <UserCheck className="w-3.5 h-3.5" />
            Verified Doctor
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-slate-900 tracking-tight block">
              F2 <span className="text-indigo-600 font-semibold">White Coat</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block -mt-1">
              Club Ledger
            </span>
          </div>
        </Link>

        {/* Role Specific Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {userRole === 'admin' && (
            <>
              <Link
                href="/admin/dashboard"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/admin/dashboard' ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/doctors"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/admin/doctors' ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Doctors Queue
              </Link>
              <Link
                href="/admin/vendors"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/admin/vendors' ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Vendors
              </Link>
              <Link
                href="/admin/transactions"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/admin/transactions' ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ledger
              </Link>
            </>
          )}

          {userRole === 'doctor' && (
            <>
              <Link
                href="/doctor/dashboard"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/doctor/dashboard' ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Wallet Home
              </Link>
              <Link
                href="/doctor/pay"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/doctor/pay' ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Scan & Pay
              </Link>
              <Link
                href="/doctor/history"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/doctor/history' ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Payment History
              </Link>
            </>
          )}

          {userRole === 'vendor' && (
            <>
              <Link
                href="/vendor/dashboard"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/vendor/dashboard' ? 'text-emerald-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Counter
              </Link>
              <Link
                href="/vendor/menu"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/vendor/menu' ? 'text-emerald-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Menu
              </Link>
              <Link
                href="/vendor/orders"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/vendor/orders' ? 'text-emerald-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Live Orders
              </Link>
            </>
          )}
        </nav>

        {/* User Info & Logout */}
        <div className="flex items-center space-x-3">
          {getRoleBadge()}
          {userName && (
            <span className="hidden sm:inline text-xs font-semibold text-slate-700 truncate max-w-[120px]">
              {userName}
            </span>
          )}
          {userRole && (
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
