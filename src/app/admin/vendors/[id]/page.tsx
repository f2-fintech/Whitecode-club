'use client';

import React, { useEffect, useState, use } from 'react';
import Navbar from '@/components/shared/Navbar';
import QRDisplay from '@/components/shared/QRDisplay';
import { IndianRupee, ArrowLeft, PlusCircle, History } from 'lucide-react';
import Link from 'next/link';

interface VendorDetail {
  _id: string;
  name: string;
  vendorCode: string;
  hospitalCluster: string;
  category: string;
  mobile: string;
  qrPayload: string;
  toppedUpBalance: number;
  collectedBalance: number;
  status: 'active' | 'suspended';
}

export default function AdminVendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [vendor, setVendor] = useState<VendorDetail | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  const [topupAmount, setTopupAmount] = useState<string>('');
  const [topupNotes, setTopupNotes] = useState<string>('Weekly cash settlement');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchVendorData = async () => {
    try {
      const [vRes, tRes] = await Promise.all([
        fetch(`/api/admin/vendors/${id}`),
        fetch(`/api/admin/transactions?vendorId=${id}`),
      ]);

      const vData = await vRes.json();
      const tData = await tRes.json();

      setVendor(vData.vendor || null);
      setTransactions(tData.transactions || []);
    } catch (err) {
      console.error('Failed to load vendor details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorData();
  }, [id]);

  const handleTopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg('');
    setError('');

    const amt = parseFloat(topupAmount);
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid top-up amount');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/vendors/${id}/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amt,
          notes: topupNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Top-up failed');
      }

      setMsg(`✅ Cash settlement of ₹${amt} topped up successfully!`);
      setTopupAmount('');
      fetchVendorData();
    } catch (err: any) {
      setError(err.message || 'Top-up error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!vendor) return;
    const newStatus = vendor.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`/api/admin/vendors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setVendor({ ...vendor, status: newStatus });
      }
    } catch (err) {
      console.error('Status toggle failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Navbar userRole="admin" userName="Super Admin" />
        <div className="py-20 text-center text-slate-500">Loading vendor account details...</div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Navbar userRole="admin" userName="Super Admin" />
        <div className="py-20 text-center text-rose-600">Vendor account not found.</div>
      </div>
    );
  }

  const settlementDue = (vendor.collectedBalance || 0) - (vendor.toppedUpBalance || 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar userRole="admin" userName="Super Admin" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <Link
          href="/admin/vendors"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Vendors
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{vendor.name}</h1>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${vendor.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
              >
                {vendor.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Code: <span className="text-indigo-600 font-semibold">{vendor.vendorCode}</span> | Cluster: {vendor.hospitalCluster} | Contact: {vendor.mobile}
            </p>
          </div>

          <button
            onClick={handleToggleStatus}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${vendor.status === 'active'
                ? 'bg-slate-100 hover:bg-rose-50 text-rose-700 border-slate-200 hover:border-rose-200'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600'
              }`}
          >
            {vendor.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
          </button>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Collected from Doctors</span>
            <div className="text-3xl font-black text-emerald-600 mt-2 font-mono">
              ₹{vendor.collectedBalance?.toLocaleString('en-IN') || 0}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Sum of doctor QR payments received</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin Top-ups (Paid Out)</span>
            <div className="text-3xl font-black text-amber-600 mt-2 font-mono">
              ₹{vendor.toppedUpBalance?.toLocaleString('en-IN') || 0}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Sum of cash settlements paid by admin</p>
          </div>

          <div className="bg-white border border-indigo-200 rounded-3xl p-6 shadow-xs bg-gradient-to-br from-white to-indigo-50/40">
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Net Settlement Due</span>
            <div className="text-3xl font-black text-indigo-600 mt-2 font-mono">
              ₹{settlementDue.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Calculated as (Collected - Topped Up)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Top-up Form */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md">
              <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                <PlusCircle className="w-6 h-6 text-amber-600" />
                Issue Cash Settlement (Top Up)
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Directly credit vendor&apos;s settlement ledger for cash payouts made outside the app.
              </p>

              {msg && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
                  {msg}
                </div>
              )}
              {error && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleTopupSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-2 uppercase tracking-wider">
                    Settlement Amount (₹)
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 2500"
                      value={topupAmount}
                      onChange={(e) => setTopupAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-mono text-lg pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-2 uppercase tracking-wider">
                    Settlement Note / Reference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Weekly cash payout settlement #102"
                    value={topupNotes}
                    onChange={(e) => setTopupNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs p-3 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl shadow-md shadow-amber-500/20 text-sm disabled:opacity-50 transition-all"
                >
                  {submitting ? 'Processing Top-up...' : 'Confirm Cash Top Up'}
                </button>
              </form>
            </div>
          </div>

          {/* QR Display */}
          <div className="flex justify-center">
            <QRDisplay
              vendorCode={vendor.vendorCode}
              vendorName={vendor.name}
              category={vendor.category}
              hospitalCluster={vendor.hospitalCluster}
            />
          </div>
        </div>

        {/* Transaction History for this Vendor */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            Vendor Transaction History
          </h2>

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-md">
            {transactions.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">No recorded transactions for this vendor.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Doctor / Initiator</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Vendor Total After</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.map((tx: any) => (
                      <tr key={tx._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 capitalize font-semibold">
                          {tx.type === 'doctor_payment' ? (
                            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-[11px]">
                              Doctor Payment
                            </span>
                          ) : (
                            <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full text-[11px]">
                              Admin Top-up
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {tx.doctorId ? tx.doctorId.name : 'System / Admin'}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-sm text-slate-900">
                          ₹{tx.amount}
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-500 text-xs">
                          ₹{tx.vendorBalanceAfter || '-'}
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-[11px]">
                          {new Date(tx.createdAt).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-[11px] truncate max-w-xs">
                          {tx.notes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
