'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import Link from 'next/link';
import { History, ArrowUpRight, ArrowDownLeft, ArrowLeft, RefreshCw } from 'lucide-react';

interface DoctorTx {
  _id: string;
  type: 'wallet_credit' | 'doctor_payment' | 'reversal' | 'order_payment';
  vendorId?: { name: string; category: string; hospitalCluster: string; vendorCode: string };
  amount: number;
  doctorBalanceAfter: number;
  notes: string;
  createdAt: string;
}

export default function DoctorHistoryPage() {
  const [transactions, setTransactions] = useState<DoctorTx[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/doctor/transactions');
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('Failed to load doctor history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar userRole="doctor" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <Link
          href="/doctor/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Wallet Home
        </Link>

        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <History className="w-8 h-8 text-indigo-600" />
              Complete Wallet History
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Full statement of your White Coat Club welcome credit and outlet QR payments.
            </p>
          </div>

          <button
            onClick={fetchHistory}
            className="py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs border border-slate-200 shadow-xs flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-md">
          {loading ? (
            <div className="py-16 text-center text-slate-500 text-sm">Loading payment statement...</div>
          ) : transactions.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm">No transaction records found.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {transactions.map((tx) => (
                <div key={tx._id} className="p-5 hover:bg-slate-50/80 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {tx.type === 'wallet_credit' ? (
                      <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                        <ArrowDownLeft className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                    )}

                    <div>
                      <div className="font-bold text-slate-900 text-base">
                        {tx.type === 'wallet_credit'
                          ? 'Welcome Wallet Credit (+₹500)'
                          : tx.type === 'order_payment'
                            ? `Pre-order @ ${tx.vendorId?.name || 'Vendor'}`
                            : tx.vendorId?.name || 'Vendor Payment'}
                      </div>

                      {tx.vendorId && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          Outlet Code: <span className="font-mono text-indigo-600 font-semibold">{tx.vendorId.vendorCode}</span> • {tx.vendorId.hospitalCluster}
                        </div>
                      )}

                      <div className="text-[11px] text-slate-400 mt-1">
                        {new Date(tx.createdAt).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-mono font-black text-lg ${tx.type === 'wallet_credit' ? 'text-indigo-600' : 'text-emerald-600'}`}>
                      {tx.type === 'wallet_credit' ? `+₹${tx.amount}` : `-₹${tx.amount}`}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      Bal after: ₹{tx.doctorBalanceAfter}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
