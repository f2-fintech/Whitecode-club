'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import QRDisplay from '@/components/shared/QRDisplay';
import { History, RefreshCw, Bell, ArrowDownLeft } from 'lucide-react';

interface VendorData {
  _id: string;
  name: string;
  vendorCode: string;
  hospitalCluster: string;
  category: string;
  mobile: string;
  toppedUpBalance: number;
  collectedBalance: number;
}

export default function VendorDashboardPage() {
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastTxCount, setLastTxCount] = useState<number>(0);
  const [newPaymentAlert, setNewPaymentAlert] = useState<string | null>(null);

  const fetchVendorData = async (isPoll = false) => {
    if (!isPoll) setLoading(true);
    try {
      const [vRes, tRes] = await Promise.all([
        fetch('/api/vendor/me'),
        fetch('/api/vendor/transactions'),
      ]);

      const vData = await vRes.json();
      const tData = await tRes.json();

      if (vData.vendor) {
        setVendor(vData.vendor);
      }

      const txs = tData.transactions || [];
      if (isPoll && txs.length > lastTxCount && lastTxCount > 0) {
        const newest = txs[0];
        if (newest && newest.type === 'doctor_payment') {
          setNewPaymentAlert(`🎉 Just Received ₹${newest.amount} from Dr. ${newest.doctorId?.name || 'Doctor'}!`);
          setTimeout(() => setNewPaymentAlert(null), 6000);
        }
      }

      setTransactions(txs);
      setLastTxCount(txs.length);
    } catch (err) {
      console.error('Vendor polling error:', err);
    } finally {
      if (!isPoll) setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorData();
    const interval = setInterval(() => {
      fetchVendorData(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [lastTxCount]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Navbar userRole="vendor" />
        <div className="py-20 text-center text-slate-500">Loading counter dashboard...</div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Navbar userRole="vendor" />
        <div className="py-20 text-center text-rose-600">Unable to load vendor outlet data.</div>
      </div>
    );
  }

  const totalBalance = (vendor.collectedBalance || 0) + (vendor.toppedUpBalance || 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar userRole="vendor" userName={vendor.name} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Real-time Payment Notification Banner */}
        {newPaymentAlert && (
          <div className="mb-6 p-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 shrink-0" />
              <span className="text-base tracking-wide">{newPaymentAlert}</span>
            </div>
            <button onClick={() => setNewPaymentAlert(null)} className="text-xs bg-white/20 px-3 py-1 rounded-lg">
              Dismiss
            </button>
          </div>
        )}

        {/* Counter Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{vendor.name}</h1>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full uppercase">
                {vendor.category}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Counter Display QR Code & Payment Ledger | Hospital: {vendor.hospitalCluster}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Real-time Payment Polling Active
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Payments Collected</span>
            <div className="text-3xl font-black text-emerald-600 mt-2 font-mono">
              ₹{vendor.collectedBalance?.toLocaleString('en-IN') || 0}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Sum of QR doctor payments</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin Top-ups Settled</span>
            <div className="text-3xl font-black text-amber-600 mt-2 font-mono">
              ₹{vendor.toppedUpBalance?.toLocaleString('en-IN') || 0}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Sum of cash settlements received</p>
          </div>

          <div className="bg-white border border-emerald-200 rounded-3xl p-6 shadow-xs bg-gradient-to-br from-white to-emerald-50/40">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Total Outlet Balance</span>
            <div className="text-3xl font-black text-slate-900 mt-2 font-mono">
              ₹{totalBalance.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Collected + Settled Top-ups</p>
          </div>
        </div>

        {/* Counter QR Display & Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* QR Display Column */}
          <div className="lg:col-span-5 flex justify-center">
            <QRDisplay
              vendorCode={vendor.vendorCode}
              vendorName={vendor.name}
              category={vendor.category}
              hospitalCluster={vendor.hospitalCluster}
            />
          </div>

          {/* Transactions List Column */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-600" />
                Live Incoming Payments
              </h2>
              <button
                onClick={() => fetchVendorData(false)}
                className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh Now
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-md">
              {transactions.length === 0 ? (
                <div className="py-16 text-center text-slate-500 text-sm">
                  No payments received yet. Display your QR code to start receiving payments.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                  {transactions.map((tx: any) => (
                    <div key={tx._id} className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                          <ArrowDownLeft className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {tx.type === 'doctor_payment'
                              ? `Received from Dr. ${tx.doctorId?.name || 'Doctor'}`
                              : 'Admin Cash Top-up Settlement'}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {new Date(tx.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} • {new Date(tx.createdAt).toLocaleDateString('en-IN')}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-black text-lg text-emerald-600">
                          +₹{tx.amount}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Balance after: ₹{tx.vendorBalanceAfter || '-'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
