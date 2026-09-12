'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserCheck, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function DoctorSignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [council, setCouncil] = useState('Delhi Medical Council');
  const [state, setState] = useState('Delhi');
  const [college, setCollege] = useState('Maulana Azad Medical College (MAMC)');
  const [consentGiven, setConsentGiven] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/doctor/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          mobile,
          password,
          registrationNumber,
          council,
          state,
          college,
          consentGiven,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Doctor registration failed');
      }

      setSuccessMsg('Registration submitted! Account verification is pending Admin review.');
      setTimeout(() => {
        router.push('/doctor/login');
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Signup error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-white/90 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl shadow-slate-200/60 relative z-10">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mx-auto mb-3 shadow-sm">
            <UserCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Join White Coat Club</h1>
          <p className="text-xs text-slate-500 mt-1">
            Register your medical credentials to receive your <strong className="text-emerald-600 font-bold">₹500 welcome credit</strong>.
          </p>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Full Name (Dr.)
            </label>
            <input
              type="text"
              placeholder="e.g. Dr. Ananya Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 text-slate-900 text-xs px-4 py-3 rounded-xl focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Mobile Number
              </label>
              <input
                type="text"
                placeholder="9876543210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 text-slate-900 text-xs px-4 py-3 rounded-xl focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Account Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 text-slate-900 text-xs px-4 py-3 rounded-xl focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Medical Registration Number
            </label>
            <input
              type="text"
              placeholder="e.g. DMC/R/12345"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 text-slate-900 text-xs px-4 py-3 rounded-xl focus:outline-none font-mono"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                State Medical Council
              </label>
              <input
                type="text"
                placeholder="e.g. Delhi Medical Council"
                value={council}
                onChange={(e) => setCouncil(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 text-slate-900 text-xs px-4 py-3 rounded-xl focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                State
              </label>
              <input
                type="text"
                placeholder="e.g. Delhi"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 text-slate-900 text-xs px-4 py-3 rounded-xl focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Medical College / Institution
            </label>
            <input
              type="text"
              placeholder="e.g. AIIMS Delhi / MAMC"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 text-slate-900 text-xs px-4 py-3 rounded-xl focus:outline-none"
              required
            />
          </div>

          <div className="flex items-start gap-2 pt-2">
            <input
              type="checkbox"
              id="consent"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-0.5 rounded accent-indigo-600"
              required
            />
            <label htmlFor="consent" className="text-[11px] text-slate-500 leading-snug">
              I consent to administrative verification of my medical council registration details for wallet access.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          >
            {loading ? 'Submitting Application...' : 'Register Doctor Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link href="/doctor/login" className="text-indigo-600 font-semibold hover:underline">
            Doctor Login
          </Link>
        </div>
      </div>
    </div>
  );
}
