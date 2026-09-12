'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import { UserCheck, CheckCircle2, XCircle, Clock, Search, ShieldAlert, Award } from 'lucide-react';

interface DoctorItem {
  _id: string;
  name: string;
  mobile: string;
  registrationNumber: string;
  council: string;
  state: string;
  college: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  walletBalance: number;
  createdAt: string;
}

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

  const fetchDoctors = async (status = statusFilter) => {
    setLoading(true);
    try {
      const query = status === 'all' ? '' : `?status=${status}`;
      const res = await fetch(`/api/admin/doctors${query}`);
      const data = await res.json();
      setDoctors(data.doctors || []);
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors(statusFilter);
  }, [statusFilter]);

  const handleVerify = async (id: string, name: string) => {
    setActionLoading(id);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/doctors/${id}/verify`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setMessage(`✅ Verified Dr. ${name}. ₹500 wallet credit assigned!`);
      fetchDoctors(statusFilter);
    } catch (err: any) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string, name: string) => {
    setActionLoading(id);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/doctors/${id}/reject`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Rejection failed');
      }

      setMessage(`⚠️ Dr. ${name}'s application rejected.`);
      fetchDoctors(statusFilter);
    } catch (err: any) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredDoctors = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.mobile.includes(search) ||
      d.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.council.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar userRole="admin" userName="Super Admin" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-200 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <UserCheck className="w-8 h-8 text-indigo-600" />
              Doctor Verification Queue
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review state medical council registration credentials and verify accounts to issue ₹500 wallet credit.
            </p>
          </div>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 shadow-md flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage('')} className="text-slate-400 hover:text-slate-700 text-xs">Dismiss</button>
          </div>
        )}

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs w-full sm:w-auto">
            {['pending', 'verified', 'rejected', 'all'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`capitalize text-xs font-semibold px-4 py-2 rounded-xl transition-all ${
                  statusFilter === tab
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, reg #, council..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-900 text-xs pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-600 shadow-xs"
            />
          </div>
        </div>

        {/* Doctors Table */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-md">
          {loading ? (
            <div className="py-16 text-center text-slate-500 text-sm">Loading doctors list...</div>
          ) : filteredDoctors.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm flex flex-col items-center">
              <ShieldAlert className="w-10 h-10 text-slate-400 mb-2" />
              <span>No doctors found in &quot;{statusFilter}&quot; filter.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Doctor Details</th>
                    <th className="px-6 py-4">Reg # & Council</th>
                    <th className="px-6 py-4">College / State</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Wallet Balance</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDoctors.map((doc) => (
                    <tr key={doc._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-sm">{doc.name}</div>
                        <div className="text-slate-500 text-xs">{doc.mobile}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-indigo-700 font-semibold">{doc.registrationNumber}</div>
                        <div className="text-slate-500 text-[11px]">{doc.council}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-800">{doc.college}</div>
                        <div className="text-slate-500 text-[11px]">{doc.state}</div>
                      </td>
                      <td className="px-6 py-4">
                        {doc.verificationStatus === 'verified' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Verified
                          </span>
                        )}
                        {doc.verificationStatus === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3.5 h-3.5" />
                            Pending Review
                          </span>
                        )}
                        {doc.verificationStatus === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5" />
                            Rejected
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-sm text-emerald-700">
                        ₹{doc.walletBalance}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {doc.verificationStatus !== 'verified' && (
                          <button
                            onClick={() => handleVerify(doc._id, doc.name)}
                            disabled={actionLoading === doc._id}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition-all disabled:opacity-50 inline-flex items-center gap-1 shadow-xs"
                          >
                            <Award className="w-3.5 h-3.5" />
                            Verify (+₹500)
                          </button>
                        )}
                        {doc.verificationStatus !== 'rejected' && (
                          <button
                            onClick={() => handleReject(doc._id, doc.name)}
                            disabled={actionLoading === doc._id}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-semibold rounded-xl text-xs border border-slate-200 transition-all disabled:opacity-50"
                          >
                            Reject
                          </button>
                        )}
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
