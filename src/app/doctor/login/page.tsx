'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserCheck, Phone, Lock, ArrowRight, AlertCircle, MessageSquare, Clock } from 'lucide-react';
import { signInWithEmailAndPassword, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

export default function DoctorLoginPage() {
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  
  // OTP States
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingNotice, setPendingNotice] = useState(false);

  // Setup invisible reCAPTCHA for Phone Auth
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Clear old verifier if it exists (fixes hot-reload/remount errors)
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch (e) {}
        window.recaptchaVerifier = null;
      }
      
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }

    return () => {
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch (e) {}
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPendingNotice(false);

    try {
      const res = await fetch('/api/auth/doctor/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Doctor login failed');
      }

      if (data.user?.verificationStatus === 'pending') {
        setPendingNotice(true);
        setLoading(false);
        return;
      }

      window.location.href = '/doctor/dashboard';
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile || mobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Adding +91 (India) country code by default. Change if needed.
      const formattedPhone = mobile.startsWith('+') ? mobile : `+91${mobile}`;
      const appVerifier = window.recaptchaVerifier;
      
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    
    setLoading(true);
    setError('');

    try {
      await confirmationResult.confirm(otp);
      window.location.href = '/doctor/dashboard';
    } catch (err: any) {
      setError(err.message || 'Invalid OTP code.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div id="recaptcha-container"></div>
      
      {/* Ambient Light */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-white/90 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-slate-200/60 relative z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mx-auto mb-4 shadow-sm">
            <UserCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Doctor Wallet Login</h1>
          <p className="text-xs text-slate-500 mt-1">Access your ₹500 White Coat Club wallet</p>
        </div>

        {/* Login Method Toggle */}
        <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
          <button
            onClick={() => { setLoginMethod('password'); setError(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              loginMethod === 'password' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Use Password
          </button>
          <button
            onClick={() => { setLoginMethod('otp'); setError(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              loginMethod === 'otp' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Use OTP
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {pendingNotice && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs flex items-center gap-3">
            <Clock className="w-5 h-5 shrink-0 text-amber-600" />
            <div>
              <strong className="block text-slate-900 font-semibold">Verification Pending</strong>
              Your medical registration is currently under review by Admin. Wallet access will be enabled once verified.
            </div>
          </div>
        )}

        {/* PASSWORD LOGIN FORM */}
        {loginMethod === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 text-slate-900 text-sm pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="e.g. 9876543210"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 text-slate-900 text-sm pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Wallet'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* OTP LOGIN FORM */}
        {loginMethod === 'otp' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  disabled={otpSent}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 text-slate-900 text-sm pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-60"
                  placeholder="e.g. 9876543210"
                  required
                />
              </div>
            </div>

            {!otpSent ? (
              <button
                onClick={handleSendOtp}
                disabled={loading || !mobile}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
                <MessageSquare className="w-4 h-4" />
              </button>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Enter 6-digit OTP
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 text-slate-900 text-sm pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-center tracking-widest font-mono font-bold"
                      placeholder="000000"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Login'}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setOtp(''); }}
                  className="w-full py-2 text-xs text-indigo-600 font-medium hover:underline text-center"
                >
                  Change Mobile Number
                </button>
              </form>
            )}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
          Don&apos;t have a Doctor account yet?{' '}
          <Link href="/doctor/signup" className="text-indigo-600 font-semibold hover:underline">
            Sign Up Here
          </Link>
        </div>
      </div>
    </div>
  );
}
