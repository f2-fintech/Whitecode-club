import Link from 'next/link';
import { Award, ShieldCheck, Store, UserCheck, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background ambient radial gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-indigo-200/40 via-emerald-100/30 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-100/40 blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              F2 <span className="text-indigo-600 font-semibold">White Coat Club</span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            href="/admin/login"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Admin Portal
          </Link>
          <Link
            href="/vendor/login"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Vendor Login
          </Link>
          <Link
            href="/doctor/login"
            className="text-xs font-semibold px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md shadow-indigo-600/20 transition-all"
          >
            Doctor Login
          </Link>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center z-10 my-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-indigo-700 mb-8 shadow-xs">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          Closed-Loop Digital Wallet for Doctors & Hospital Outlets
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          Exclusive Perks & Seamless Payments for <span className="bg-gradient-to-r from-indigo-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">Verified Doctors</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
          Admin-verified doctors unlock an automatic <strong className="text-emerald-600 font-bold">₹500 welcome credit</strong>. Scan static QR codes at hospital canteens, food courts, and pharmacies for instant payment.
        </p>

        {/* Portal Entry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14 text-left">
          {/* Doctor Card */}
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 hover:border-indigo-500/50 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between shadow-md shadow-slate-200/50">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Doctor Portal</h3>
              <p className="text-sm text-slate-500 mb-6">
                Sign up with your medical council registration. Get verified and instantly claim your ₹500 wallet balance.
              </p>
            </div>
            <div className="space-y-2">
              <Link
                href="/doctor/signup"
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-semibold rounded-xl text-center text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                Sign Up as Doctor
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/doctor/login"
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-center text-xs block border border-slate-200/80"
              >
                Doctor Login
              </Link>
            </div>
          </div>

          {/* Vendor Card */}
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 hover:border-emerald-500/50 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between shadow-md shadow-slate-200/50">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Vendor Counter</h3>
              <p className="text-sm text-slate-500 mb-6">
                Hospital canteens and outlets. Access counter static QR code, view incoming doctor payments and settlements.
              </p>
            </div>
            <Link
              href="/vendor/login"
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-center text-sm shadow-md flex items-center justify-center gap-2"
            >
              Vendor Login
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Admin Card */}
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 hover:border-amber-500/50 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between shadow-md shadow-slate-200/50">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Admin Control</h3>
              <p className="text-sm text-slate-500 mb-6">
                Verify doctor applications, onboard vendor outlets, perform cash settlements (top-ups), and monitor ledger.
              </p>
            </div>
            <Link
              href="/admin/login"
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-center text-sm shadow-md flex items-center justify-center gap-2"
            >
              Admin Login
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* System Info Banner */}
        <div className="mt-12 bg-white border border-slate-200 rounded-2xl p-4 max-w-xl mx-auto flex items-center justify-between text-left text-xs text-slate-600 shadow-sm">
          {/* <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Default Admin: <code className="text-indigo-700 font-mono font-semibold">admin@f2whitecoat.com</code> / <code className="text-indigo-700 font-mono font-semibold">AdminPass123!</code></span>
          </div> */}
          {/* <Link
            href="/api/seed"
            target="_blank"
            className="text-indigo-600 hover:underline font-bold text-xs shrink-0"
          >
            Run Seed DB
          </Link> */}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 z-10">
        © 2026 F2 White Coat Club. Closed-Loop Ledger System. All rights reserved.
      </footer>
    </div>
  );
}
