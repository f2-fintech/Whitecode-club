'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import Link from 'next/link';
import { Wallet, QrCode, Clock, Search, Coffee, Pizza, Utensils, Info, Navigation, ArrowRight } from 'lucide-react';

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

      <main className="max-w-md mx-auto w-full flex-1 relative bg-white sm:border-x sm:border-slate-200 shadow-xl overflow-hidden pb-20">
        {/* Top Header Gradient */}
        <div className="bg-gradient-to-b from-rose-600 to-rose-500 px-4 pt-6 pb-24 text-white relative">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-1 text-rose-100 text-sm font-semibold">
                <Navigation className="w-4 h-4" /> Campus Punjab
              </div>
              <div className="text-xs text-rose-200 mt-1">F2 White Coat Ledger</div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-rose-200 uppercase font-bold tracking-wider">Wallet</span>
                <span className="font-mono font-black text-lg">₹{doctor.walletBalance}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Wallet className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="absolute -bottom-6 left-4 right-4">
            <div className="bg-white rounded-2xl shadow-lg flex items-center px-4 py-3">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input 
                type="text"
                placeholder="Search for 'Pizza' or Vendors..."
                className="ml-3 w-full outline-none text-slate-700 text-sm font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Verification Status Warning */}
        {!isVerified && (
          <div className="mt-12 mx-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex gap-3 shadow-sm">
            <Clock className="w-5 h-5 shrink-0 text-amber-600" />
            <div>
              <strong className="block text-sm font-bold mb-1">Account Under Review</strong>
              Your profile is pending admin approval. Ordering and wallet features are temporarily locked.
            </div>
          </div>
        )}

        {/* Collections Grid */}
        <div className={`mt-10 px-4 ${!isVerified ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Collections</span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          <div className="grid grid-cols-4 gap-y-6 gap-x-2">
            {[
              { icon: Pizza, label: 'Snacks', color: 'text-amber-500', bg: 'bg-amber-50' },
              { icon: Coffee, label: 'Coffee', color: 'text-stone-600', bg: 'bg-stone-100' },
              { icon: Utensils, label: 'Meals', color: 'text-rose-500', bg: 'bg-rose-50' },
              { icon: Info, label: 'Pharmacy', color: 'text-emerald-500', bg: 'bg-emerald-50' },
            ].map((col, i) => (
              <div key={i} className="flex flex-col items-center gap-2 cursor-pointer group">
                <div className={`w-14 h-14 rounded-full ${col.bg} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                  <col.icon className={`w-6 h-6 ${col.color}`} />
                </div>
                <span className="text-[10px] font-bold text-slate-700">{col.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Vendors List (Newly Launched / All) */}
        <div className={`mt-8 px-4 ${!isVerified ? 'opacity-50 pointer-events-none' : ''}`}>
           <div className="flex justify-between items-end mb-4">
             <h2 className="text-lg font-black text-slate-900 tracking-tight">Canteens & Food Courts</h2>
           </div>

           <div className="space-y-4">
             {filteredVendors.length === 0 ? (
               <div className="text-center py-8 text-slate-500 text-sm">No vendors found.</div>
             ) : (
               filteredVendors.map(vendor => (
                 <Link href={`/doctor/vendor/${vendor._id}`} key={vendor._id} className="block">
                   <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                     {/* Gradient flair */}
                     <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -z-10" />
                     
                     <div className="flex justify-between items-start">
                       <div>
                         <h3 className="font-bold text-lg text-slate-900">{vendor.name}</h3>
                         <p className="text-xs text-slate-500 mt-0.5">{vendor.hospitalCluster}</p>
                       </div>
                       <div className="bg-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                         Full Menu
                       </div>
                     </div>

                     <div className="mt-4 flex items-center gap-2">
                       <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 uppercase tracking-wide">
                         {vendor.category}
                       </span>
                     </div>
                   </div>
                 </Link>
               ))
             )}
           </div>
        </div>

        {/* Bottom Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 sm:absolute sm:bottom-0 bg-white border-t border-slate-200 h-16 flex items-center justify-around px-2 pb-safe z-50">
          <Link href="/doctor/dashboard" className="flex flex-col items-center gap-1 text-rose-600">
            <Utensils className="w-6 h-6" />
            <span className="text-[10px] font-bold">Explore</span>
          </Link>
          
          <Link href="/doctor/pay" className="flex flex-col items-center gap-1 -mt-6">
            <div className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center shadow-lg border-4 border-white text-white">
              <QrCode className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-slate-600">Scan QR</span>
          </Link>

          <Link href="/doctor/history" className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-900 transition-colors">
            <Clock className="w-6 h-6" />
            <span className="text-[10px] font-bold">Orders</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
