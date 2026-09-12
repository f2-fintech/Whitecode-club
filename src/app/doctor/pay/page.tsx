'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/shared/Navbar';
import QRScanner from '@/components/shared/QRScanner';
import { Store, IndianRupee, ArrowLeft, CheckCircle2, AlertCircle, Wallet } from 'lucide-react';
import Link from 'next/link';

interface VendorInfo {
  _id: string;
  name: string;
  vendorCode: string;
  hospitalCluster: string;
  category: string;
}

export default function DoctorPayPage() {
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [vendorInfo, setVendorInfo] = useState<VendorInfo | null>(null);
  const [amount, setAmount] = useState<string>('');

  const [loadingVendor, setLoadingVendor] = useState<boolean>(false);
  const [paying, setPaying] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successReceipt, setSuccessReceipt] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/doctor/wallet')
      .then((res) => res.json())
      .then((data) => {
        if (data.walletBalance !== undefined) {
          setWalletBalance(data.walletBalance);
        }
      })
      .catch(console.error);
  }, []);

  const handleScanSuccess = async (code: string) => {
    setError('');
    setLoadingVendor(true);

    try {
      const res = await fetch(`/api/doctor/pay?vendorCode=${encodeURIComponent(code)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid Vendor QR code');
      }

      setVendorInfo(data.vendor);
    } catch (err: any) {
      setError(err.message || 'Vendor lookup failed');
      setVendorInfo(null);
    } finally {
      setLoadingVendor(false);
    }
  };

  const handleConfirmPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorInfo) return;

    const payAmount = parseFloat(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    if (walletBalance !== null && payAmount > walletBalance) {
      setError(`Insufficient wallet balance (Available: ₹${walletBalance})`);
      return;
    }

    setPaying(true);
    setError('');

    try {
      const res = await fetch('/api/doctor/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorCode: vendorInfo.vendorCode,
          amount: payAmount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      setSuccessReceipt(data.payment);
    } catch (err: any) {
      setError(err.message || 'Payment processing error');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar userRole="doctor" />

      <main className="max-w-xl mx-auto px-4 py-8 w-full flex-1 flex flex-col justify-center">
        <Link
          href="/doctor/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Wallet Home
        </Link>

        {/* Available Wallet Balance Pill */}
        {walletBalance !== null && (
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 mb-6 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Wallet className="w-4 h-4 text-indigo-600" />
              <span>Available Balance:</span>
            </div>
            <span className="font-mono font-black text-lg text-emerald-600">₹{walletBalance}</span>
          </div>
        )}

        {/* Step 3: SUCCESS RECEIPT SCREEN */}
        {successReceipt ? (
          <div className="bg-white border border-emerald-300 rounded-3xl p-8 text-center shadow-xl relative overflow-hidden animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">
              Payment Successful!
            </span>
            <h2 className="text-4xl font-black text-slate-900 font-mono my-2">₹{successReceipt.amountPaid}</h2>

            <p className="text-sm font-semibold text-slate-700 mt-2">
              Paid to <span className="text-slate-900 font-bold">{successReceipt.vendorName}</span>
            </p>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{successReceipt.vendorCode}</p>

            <div className="my-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2 text-left">
              <div className="flex justify-between text-slate-600">
                <span>Remaining Wallet Balance:</span>
                <span className="font-mono font-bold text-emerald-600 text-sm">₹{successReceipt.remainingBalance}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Timestamp:</span>
                <span className="text-slate-900">{new Date(successReceipt.timestamp).toLocaleTimeString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600 truncate">
                <span>Transaction Ref:</span>
                <span className="font-mono text-slate-400 text-[10px]">{successReceipt.transactionId}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/doctor/dashboard"
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                Return to Wallet Home
              </Link>
              <button
                onClick={() => {
                  setSuccessReceipt(null);
                  setVendorInfo(null);
                  setAmount('');
                }}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
              >
                Make Another Payment
              </button>
            </div>
          </div>
        ) : vendorInfo ? (
          /* Step 2: VENDOR CONFIRMATION & AMOUNT ENTRY SCREEN */
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl relative">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-3">
                <Store className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Paying Vendor Outlet</span>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">{vendorInfo.name}</h2>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-2">
                <span className="bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 font-mono text-indigo-700">
                  {vendorInfo.vendorCode}
                </span>
                <span className="bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 capitalize">
                  {vendorInfo.category}
                </span>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleConfirmPay} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 text-center">
                  Enter Payment Amount (₹)
                </label>
                <div className="relative max-w-xs mx-auto">
                  <IndianRupee className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    step="any"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-indigo-500/40 focus:border-emerald-500 text-slate-900 font-mono text-center text-3xl font-black pl-12 pr-6 py-4 rounded-2xl focus:outline-none shadow-xs"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={paying}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-base shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                >
                  {paying ? 'Processing Payment...' : `Confirm & Pay ₹${amount || '0'}`}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVendorInfo(null);
                    setError('');
                  }}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 font-semibold rounded-xl text-xs transition-colors"
                >
                  Cancel / Rescan QR
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Step 1: SCANNER SCREEN */
          <div className="flex justify-center">
            {loadingVendor ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 text-sm">
                Verifying vendor QR details...
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                {error && (
                  <div className="w-full max-w-md mb-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{error}</span>
                  </div>
                )}
                <QRScanner onScanSuccess={handleScanSuccess} />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
