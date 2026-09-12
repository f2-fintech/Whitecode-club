'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import Link from 'next/link';
import { Users, Store, IndianRupee, ArrowRight, Clock, FileText, PlusCircle } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    pendingDoctors: 0,
    totalDoctors: 0,
    verifiedDoctors: 0,
    totalVendors: 0,
    totalCredited: 0,
    totalCollected: 0,
    totalToppedUp: 0,
    totalTransactions: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [docsRes, vendsRes, txsRes] = await Promise.all([
          fetch('/api/admin/doctors'),
          fetch('/api/admin/vendors'),
          fetch('/api/admin/transactions'),
        ]);

        const docsData = await docsRes.json();
        const vendsData = await vendsRes.json();
        const txsData = await txsRes.json();

        const doctors = docsData.doctors || [];
        const vendors = vendsData.vendors || [];
        const transactions = txsData.transactions || [];

        const pending = doctors.filter((d: any) => d.verificationStatus === 'pending').length;
        const verified = doctors.filter((d: any) => d.verificationStatus === 'verified').length;
        const creditedSum = verified * 500;

        let collectedSum = 0;
        let toppedUpSum = 0;
        vendors.forEach((v: any) => {
          collectedSum += v.collectedBalance || 0;
          toppedUpSum += v.toppedUpBalance || 0;
        });

        setStats({
          pendingDoctors: pending,
          totalDoctors: doctors.length,
          verifiedDoctors: verified,
          totalVendors: vendors.length,
          totalCredited: creditedSum,
          totalCollected: collectedSum,
          totalToppedUp: toppedUpSum,
          totalTransactions: transactions.length,
        });
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar userRole="admin" userName="Super Admin" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-200 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Overview</h1>
            <p className="text-sm text-slate-500 mt-1">
              System ledger metrics, doctor verification queue, and vendor settlements.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/doctors"
              className="py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded-xl text-xs border border-amber-200 transition-all flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Pending Queue ({stats.pendingDoctors})
            </Link>
            <Link
              href="/admin/vendors"
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Add / Manage Vendors
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Doctors Queue Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Verification</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-slate-900">{stats.pendingDoctors}</span>
              <span className="text-xs text-slate-500 ml-2">doctors waiting</span>
            </div>
            <Link href="/admin/doctors" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:underline">
              Review Queue <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Wallets Issued */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified Doctors</span>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-slate-900">{stats.verifiedDoctors}</span>
              <span className="text-xs text-slate-500 ml-2">/ {stats.totalDoctors} total</span>
            </div>
            <div className="mt-4 text-xs text-slate-600">
              Total Credited: <strong className="text-emerald-600 font-bold">₹{stats.totalCredited.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {/* Vendors Registered */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Vendor Outlets</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Store className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-slate-900">{stats.totalVendors}</span>
              <span className="text-xs text-slate-500 ml-2">active outlets</span>
            </div>
            <div className="mt-4 text-xs text-slate-600">
              Payments Collected: <strong className="text-slate-900 font-bold">₹{stats.totalCollected.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {/* System Ledger */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Transactions</span>
              <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-slate-900">{stats.totalTransactions}</span>
              <span className="text-xs text-slate-500 ml-2">entries recorded</span>
            </div>
            <Link href="/admin/transactions" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline">
              View Full Ledger <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <h2 className="text-xl font-bold text-slate-900 mb-4">Management Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin/doctors"
            className="bg-white border border-slate-200/90 hover:border-indigo-500/50 rounded-3xl p-6 transition-all group shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Doctor Management</h3>
                <p className="text-xs text-slate-500">Review pending registrations and verify council IDs</p>
              </div>
            </div>
            <span className="text-xs text-indigo-600 font-bold group-hover:underline flex items-center gap-1 mt-4">
              Open Doctor Queue <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/admin/vendors"
            className="bg-white border border-slate-200/90 hover:border-emerald-500/50 rounded-3xl p-6 transition-all group shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Vendor Outlets & Topup</h3>
                <p className="text-xs text-slate-500">Onboard canteen outlets, generate QRs, and issue settlements</p>
              </div>
            </div>
            <span className="text-xs text-emerald-600 font-bold group-hover:underline flex items-center gap-1 mt-4">
              Manage Vendor Accounts <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/admin/transactions"
            className="bg-white border border-slate-200/90 hover:border-amber-500/50 rounded-3xl p-6 transition-all group shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
                <IndianRupee className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">System Ledger & Audits</h3>
                <p className="text-xs text-slate-500">Append-only audit trail for all credits, payments, and settlements</p>
              </div>
            </div>
            <span className="text-xs text-amber-600 font-bold group-hover:underline flex items-center gap-1 mt-4">
              Audit System Ledger <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
