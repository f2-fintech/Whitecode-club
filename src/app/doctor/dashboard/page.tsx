'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import Link from 'next/link';
import { Wallet, QrCode, Clock, Search, Navigation, ArrowRight, Store } from 'lucide-react';

interface DoctorProfile {
  _id: string;
  name: string;
  mobile: string;
  registrationNumber: string;
  council: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  walletBalance: number;
}

export default function DoctorDashboardPage() {
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDoctorData = async () => {
    try {
      const [dRes, vRes] = await Promise.all([
        fetch('/api/doctor/me'),
        fetch('/api/doctor/vendors'),
      ]);

      const dData = await dRes.json();
      const vData = await vRes.json();

      setDoctor(dData.doctor || null);
      if (vData.vendors) setVendors(vData.vendors);
    } catch (err) {
      console.error('Failed to load doctor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar userRole="doctor" />
        <div className="py-20 text-center text-slate-500">Loading your app...</div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar userRole="doctor" />
        <div className="py-20 text-center text-rose-600">Profile not found. Please log in again.</div>
      </div>
    );
  }

  const isVerified = doctor.verificationStatus === 'verified';
  
  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar userRole="doctor" userName={doctor.name} />

      <main className="max-w-7xl mx-auto w-full flex-1 flex flex-col relative md:px-6 lg:px-8 pb-24 md:pb-8 bg-slate-50">
        
        {/* Top Header Gradient */}
        <div className="bg-gradient-to-b from-blue-700 to-indigo-800 px-5 py-6 md:p-8 text-white md:rounded-b-3xl md:rounded-t-none shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

          <div className="flex justify-between items-center w-full md:w-auto md:gap-12 relative z-10">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Hello, Dr. {doctor.name.split(' ')[1] || doctor.name.split(' ')[0]}</h1>
              <p className="text-blue-200 text-xs md:text-sm mt-1">Ready to grab a bite?</p>
            </div>
            
            {/* Mobile Wallet */}
            <div className="flex gap-3 items-center bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20 md:hidden">
              <div className="flex flex-col items-end px-2">
                <span className="text-[9px] text-blue-200 uppercase font-bold tracking-wider mb-0.5">Balance</span>
                <span className="font-mono font-black text-xl leading-none">₹{doctor.walletBalance}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-inner text-blue-700 shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search Bar - Integrated inside header now */}
          <div className="flex-1 w-full max-w-xl mx-auto relative z-10">
            <div className="bg-white/10 rounded-2xl flex items-center px-4 py-2.5 border border-white/20 backdrop-blur-md focus-within:bg-white/20 transition-colors shadow-inner">
              <Search className="w-5 h-5 text-blue-200 shrink-0" />
              <input 
                type="text"
                placeholder="Search canteens or pharmacies..."
                className="ml-3 w-full outline-none text-white text-sm font-medium placeholder-blue-200/70 bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Desktop Wallet (hidden on mobile, shown on md up) */}
          <div className="hidden md:flex gap-4 items-center bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/20 relative z-10 hover:bg-white/15 transition-colors cursor-pointer">
            <div className="flex flex-col items-end px-2">
              <span className="text-[10px] text-blue-200 uppercase font-bold tracking-wider mb-0.5">Wallet Balance</span>
              <span className="font-mono font-black text-2xl leading-none">₹{doctor.walletBalance}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-inner text-blue-700 shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Verification Status Warning */}
        {!isVerified && (
          <div className="mt-8 mx-5 md:mx-0 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex gap-3 shadow-sm">
            <Clock className="w-5 h-5 shrink-0 text-amber-600" />
            <div>
              <strong className="block text-sm font-bold mb-1">Account Under Review</strong>
              Your profile is pending admin approval. Ordering and wallet features are temporarily locked.
            </div>
          </div>
        )}

        {/* Vendors List (Responsive Grid) */}
        <div className={`mt-8 px-5 md:px-0 flex-1 ${!isVerified ? 'opacity-50 pointer-events-none' : ''}`}>
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">Available Vendors</h2>
             <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">{filteredVendors.length} Found</span>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
             {filteredVendors.length === 0 ? (
               <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
                 <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                 <p className="text-slate-500 text-sm font-medium">No vendors found matching your criteria.</p>
               </div>
             ) : (
               filteredVendors.map(vendor => (
                 <Link href={`/doctor/vendor/${vendor._id}`} key={vendor._id} className="block group h-full">
                   <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm group-hover:shadow-md group-hover:border-blue-300 transition-all relative overflow-hidden flex flex-col justify-between h-full">
                     
                     <div className="flex items-start gap-4">
                       <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                          <Store className="w-6 h-6" />
                       </div>
                       <div className="flex-1">
                         <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-700 transition-colors leading-tight mb-2">{vendor.name}</h3>
                         <div className="flex flex-wrap items-center gap-2">
                           <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
                             {vendor.category}
                           </span>
                           <span className="text-[11px] text-slate-400 font-medium">
                             • {vendor.hospitalCluster || 'Main Campus'}
                           </span>
                         </div>
                       </div>
                     </div>
                     
                     <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-semibold text-blue-600">View Menu</span>
                        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <ArrowRight className="w-3 h-3" />
                        </div>
                     </div>
                   </div>
                 </Link>
               ))
             )}
           </div>
        </div>

        {/* Bottom Navigation Bar (Mobile Only) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex items-center justify-around px-2 pb-safe z-50 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
          <Link href="/doctor/dashboard" className="flex flex-col items-center gap-1 text-blue-600">
            <Store className="w-5 h-5" />
            <span className="text-[10px] font-bold">Vendors</span>
          </Link>
          
          <Link href="/doctor/pay" className="flex flex-col items-center gap-1 -mt-6">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30 border-4 border-white text-white transform hover:scale-105 transition-transform">
              <QrCode className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-slate-600 mt-0.5">Scan & Pay</span>
          </Link>

          <Link href="/doctor/history" className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-900 transition-colors">
            <Clock className="w-5 h-5" />
            <span className="text-[10px] font-bold">History</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
