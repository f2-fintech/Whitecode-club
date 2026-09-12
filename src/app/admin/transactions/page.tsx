'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import { FileText, Search, ArrowUpRight, ArrowDownLeft, ShieldCheck, RefreshCw } from 'lucide-react';

interface TransactionItem {
  _id: string;
  type: 'wallet_credit' | 'doctor_payment' | 'vendor_topup' | 'reversal';
  doctorId?: { name: string; mobile: string };
  vendorId?: { name: string; vendorCode: string; hospitalCluster: string };
  adminId?: { name: string; email: string };
  amount: number;
  doctorBalanceAfter?: number;
  vendorBalanceAfter?: number;
  initiatedBy: string;
  status: string;
  notes: string;
  createdAt: string;
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const query = typeFilter === 'all' ? '' : `?type=${typeFilter}`;
      const res = await fetch(`/api/admin/transactions${query}`);
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter]);

  const filtered = transactions.filter((tx) => {
    const docName = tx.doctorId?.name || '';
    const vendName = tx.vendorId?.name || '';
    const vendCode = tx.vendorId?.vendorCode || '';
    const q = search.toLowerCase();
    return (
      docName.toLowerCase().includes(q) ||
      vendName.toLowerCase().includes(q) ||
      vendCode.toLowerCase().includes(q) ||
      tx._id.includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar userRole="admin" userName="Super Admin" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-200 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <FileText className="w-8 h-8 text-teal-600" />
              Append-Only System Ledger
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Immutable audit trail of all doctor wallet credits, QR payments, and vendor cash top-ups.
            </p>
          </div>

          <button
            onClick={fetchTransactions}
            className="py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs border border-slate-200 shadow-xs flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Ledger
          </button>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs w-full sm:w-auto">
            {['all', 'wallet_credit', 'doctor_payment', 'vendor_topup'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`capitalize text-xs font-semibold px-3 py-2 rounded-xl transition-all ${
                  typeFilter === t
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search doctor, vendor, or TX ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-900 text-xs pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-teal-600 shadow-xs"
            />
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-md">
          {loading ? (
            <div className="py-16 text-center text-slate-500 text-sm">Loading ledger history...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm">No transaction records match filter.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Transaction Type</th>
                    <th className="px-6 py-4">Doctor</th>
                    <th className="px-6 py-4">Vendor Outlet</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Balances After</th>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        {tx.type === 'wallet_credit' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                            Welcome Credit
                          </span>
                        )}
                        {tx.type === 'doctor_payment' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            Doctor Payment
                          </span>
                        )}
                        {tx.type === 'vendor_topup' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Admin Top-Up
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-800">
                        {tx.doctorId ? (
                          <div>
                            <div className="font-bold text-slate-900">{tx.doctorId.name}</div>
                            <div className="text-[11px] text-slate-500">{tx.doctorId.mobile}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-800">
                        {tx.vendorId ? (
                          <div>
                            <div className="font-bold text-slate-900">{tx.vendorId.name}</div>
                            <div className="text-[11px] text-indigo-600 font-mono">{tx.vendorId.vendorCode}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono font-extrabold text-sm text-slate-900">
                        ₹{tx.amount}
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] text-slate-500 space-y-0.5">
                        {tx.doctorBalanceAfter !== null && tx.doctorBalanceAfter !== undefined && (
                          <div>Doc: ₹{tx.doctorBalanceAfter}</div>
                        )}
                        {tx.vendorBalanceAfter !== null && tx.vendorBalanceAfter !== undefined && (
                          <div>Vend: ₹{tx.vendorBalanceAfter}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-[11px]">
                        {new Date(tx.createdAt).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-[11px] max-w-xs truncate">
                        {tx.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
