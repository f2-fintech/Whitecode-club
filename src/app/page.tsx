import Link from 'next/link';
import { Award, ShieldCheck, Store, UserCheck, ArrowRight, Zap, ChevronRight, Activity, CreditCard, QrCode } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f4f7fe] text-slate-800 flex flex-col justify-between selection:bg-blue-500/30 selection:text-blue-900 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements - Light Blue Theme */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full blur-[120px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-tl from-cyan-300 to-blue-500 rounded-full blur-[120px] opacity-20 pointer-events-none" />
      
      {/* Decorative Circles (like in the image) */}
      <div className="absolute top-20 right-[10%] w-64 h-64 bg-blue-100 rounded-full opacity-50 mix-blend-multiply pointer-events-none" />
      <div className="absolute top-40 right-[15%] w-32 h-32 bg-indigo-100 rounded-full opacity-60 mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-20 left-[10%] w-96 h-96 bg-blue-50 rounded-full opacity-70 mix-blend-multiply pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-2 flex items-center justify-between z-20 relative backdrop-blur-md bg-white/40 border-b border-white/60 shadow-sm rounded-b-3xl">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-[1px] group-hover:scale-105 transition-transform duration-300 shadow-md shadow-blue-500/20">
            <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              F2 <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">White Coat</span>
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-1 bg-white/60 border border-slate-200/50 p-1.5 rounded-2xl backdrop-blur-md shadow-sm">
          <Link
            href="/admin/login"
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50/50 rounded-xl transition-all"
          >
            Admin
          </Link>
          <Link
            href="/vendor/login"
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50/50 rounded-xl transition-all"
          >
            Vendor
          </Link>
          <Link
            href="/doctor/login"
            className="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] transition-all flex items-center gap-2"
          >
            Doctor Login <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center z-10 my-auto relative">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-blue-100 text-xs font-medium text-blue-700 mb-8 shadow-sm hover:border-blue-200 transition-colors cursor-default">
          <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
          Next-Gen Closed-Loop Digital Wallet for Healthcare
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
          Exclusive Perks for <br className="hidden sm:block" />
          <span className="relative whitespace-nowrap">
            <span className="relative z-10 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Verified Doctors</span>
            <span className="absolute -bottom-2 left-0 right-0 h-[0.2em] bg-blue-200/50 rounded-full -z-10"></span>
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed">
          Admin-verified doctors unlock an automatic <strong className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">₹500 welcome credit</strong>. Scan static QR codes at hospital canteens, food courts, and pharmacies for instant, seamless payments.
        </p>

        {/* Ecosystem Flow Section */}
        <div className="mt-24 relative z-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">How The Ecosystem Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">A seamless, closed-loop payment experience connecting medical professionals with hospital services.</p>
          </div>

          <div className="relative max-w-5xl mx-auto">
             {/* Connecting Line (desktop) */}
             <div className="hidden md:block absolute top-24 left-[10%] right-[10%] h-0.5 bg-blue-100 z-0">
                <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-30"></div>
                
                {/* Moving dots on the line */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)] animate-[ping_3s_infinite]"></div>
                <div className="absolute top-1/2 -translate-y-1/2 left-1/2 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)] animate-[ping_3s_infinite_1s]"></div>
                <div className="absolute top-1/2 -translate-y-1/2 right-0 w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.6)] animate-[ping_3s_infinite_2s]"></div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                {/* Step 1: Doctor */}
                <div className="bg-white/80 backdrop-blur-xl border border-blue-100 p-8 rounded-3xl relative group hover:-translate-y-2 transition-transform duration-500 hover:border-blue-300 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)] shadow-xl shadow-slate-200/50">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300">
                     <UserCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 text-center mb-3">1. Doctor Verification</h3>
                  <p className="text-slate-600 text-center text-sm leading-relaxed">
                    Doctors register and are verified by Company, instantly receiving <strong className="text-blue-700">₹500 welcome credit</strong> in their digital wallet.
                  </p>
                </div>

                {/* Step 2: Transaction */}
                <div className="bg-white/80 backdrop-blur-xl border border-indigo-100 p-8 rounded-3xl relative group mt-0 md:mt-12 hover:-translate-y-2 transition-transform duration-500 hover:border-indigo-300 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.15)] shadow-xl shadow-slate-200/50">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300">
                     <QrCode className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 text-center mb-3">2. Scan & Pay</h3>
                  <p className="text-slate-600 text-center text-sm leading-relaxed">
                    Doctors scan static QR codes at hospital canteens and pharmacies for seamless, cashless payments.
                  </p>
                </div>

                {/* Step 3: Vendor */}
                <div className="bg-white/80 backdrop-blur-xl border border-purple-100 p-8 rounded-3xl relative group hover:-translate-y-2 transition-transform duration-500 hover:border-purple-300 hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.15)] shadow-xl shadow-slate-200/50">
                  <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mx-auto mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300">
                     <Store className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 text-center mb-3">3. Vendor Settlement</h3>
                  <p className="text-slate-600 text-center text-sm leading-relaxed">
                    Vendors receive real-time notifications for incoming payments. Admins handle bulk cash settlements.
                  </p>
                </div>
             </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-20">
            <Link 
              href="/doctor/signup" 
              className="px-8 py-4 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)] hover:shadow-[0_10px_25px_-5px_rgba(37,99,235,0.6)] hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Get Started as Doctor <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/vendor/login" 
              className="px-8 py-4 w-full sm:w-auto bg-white text-blue-700 font-semibold rounded-xl border border-blue-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm transition-all duration-300 flex items-center justify-center"
            >
              Vendor Access
            </Link>
        </div>
        
        {/* Features / Stats row */}
        <div className="mt-20 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-slate-200 pt-12">
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-slate-900 font-semibold text-base sm:text-lg">Instant</h4>
              <p className="text-xs sm:text-sm text-slate-500">Zero-lag transactions</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-slate-900 font-semibold text-base sm:text-lg">Secure</h4>
              <p className="text-xs sm:text-sm text-slate-500">Verified doctor network</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-slate-900 font-semibold text-base sm:text-lg">Tracked</h4>
              <p className="text-xs sm:text-sm text-slate-500">Transparent ledger</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-sm">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-slate-900 font-semibold text-base sm:text-lg">Cashless</h4>
              <p className="text-xs sm:text-sm text-slate-500">Scan & Pay anywhere</p>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center text-xs text-slate-500 z-10 bg-slate-50/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="font-medium">System Status: All Systems Operational</span>
          </div>
          <p>© 2026 F2 White Coat Club. Closed-Loop Ledger System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
