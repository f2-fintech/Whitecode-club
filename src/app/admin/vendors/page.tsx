'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import Link from 'next/link';
import { Store, Plus, Search, Building2, ShieldAlert, Eye } from 'lucide-react';

interface VendorItem {
  _id: string;
  name: string;
  vendorCode: string;
  hospitalCluster: string;
  category: string;
  mobile: string;
  toppedUpBalance: number;
  collectedBalance: number;
  status: 'active' | 'suspended';
  createdAt: string;
}

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Add form fields
  const [name, setName] = useState('');
  const [hospitalCluster, setHospitalCluster] = useState('Max Super Speciality Hospital');
  const [category, setCategory] = useState('canteen');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('VendorPass123!');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/vendors');
      const data = await res.json();
      setVendors(data.vendors || []);
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/admin/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          hospitalCluster,
          category,
          mobile,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create vendor');
      }

      setMessage(`✅ Vendor "${data.vendor.name}" created! Vendor Code: ${data.vendor.vendorCode}`);
      setShowAddModal(false);
      setName('');
      setMobile('');
      fetchVendors();
    } catch (err: any) {
      setError(err.message || 'Error creating vendor');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredVendors = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.vendorCode.toLowerCase().includes(search.toLowerCase()) ||
      v.hospitalCluster.toLowerCase().includes(search.toLowerCase()) ||
      v.mobile.includes(search)
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar userRole="admin" userName="Super Admin" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-200 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Store className="w-8 h-8 text-emerald-600" />
              Vendor Outlets & Settlements
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Onboard hospital canteens, view static QR payloads, and record cash settlement top-ups.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="py-3 px-5 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Vendor Outlet
          </button>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800 shadow-sm flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage('')} className="text-slate-400 hover:text-slate-700 text-xs">Dismiss</button>
          </div>
        )}

        {/* Search */}
        <div className="mb-6 max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search vendor name, code, hospital..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-900 text-xs pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-emerald-600 shadow-xs"
            />
          </div>
        </div>

        {/* Vendor Cards / Table */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-md">
          {loading ? (
            <div className="py-16 text-center text-slate-500 text-sm">Loading vendors list...</div>
          ) : filteredVendors.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm flex flex-col items-center">
              <ShieldAlert className="w-10 h-10 text-slate-400 mb-2" />
              <span>No vendor outlets found.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Outlet & Code</th>
                    <th className="px-6 py-4">Hospital Cluster</th>
                    <th className="px-6 py-4">Category & Contact</th>
                    <th className="px-6 py-4">Doctor Payments</th>
                    <th className="px-6 py-4">Admin Top-ups</th>
                    <th className="px-6 py-4">Settlement Due</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVendors.map((vendor) => {
                    const due = (vendor.collectedBalance || 0) - (vendor.toppedUpBalance || 0);
                    return (
                      <tr key={vendor._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 text-sm">{vendor.name}</div>
                          <div className="font-mono text-indigo-600 font-semibold text-[11px]">{vendor.vendorCode}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          <span className="inline-flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {vendor.hospitalCluster}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="capitalize inline-block bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium text-slate-700 mb-1 border border-slate-200">
                            {vendor.category}
                          </span>
                          <div className="text-slate-500 text-[11px]">{vendor.mobile}</div>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-emerald-600 font-bold">
                          ₹{vendor.collectedBalance?.toLocaleString('en-IN') || 0}
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-amber-600 font-bold">
                          ₹{vendor.toppedUpBalance?.toLocaleString('en-IN') || 0}
                        </td>
                        <td className="px-6 py-4 font-mono text-sm font-black">
                          <span className={due > 0 ? 'text-indigo-600' : 'text-slate-500'}>
                            ₹{due.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/admin/vendors/${vendor._id}`}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-all inline-flex items-center gap-1.5 shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Top Up & Detail
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Vendor Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
              <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Store className="w-6 h-6 text-emerald-600" />
                Add Vendor Outlet
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                System will generate a unique Vendor Code and QR code payload automatically.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateVendor} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Outlet Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Apollo Main Canteen"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 rounded-xl focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Hospital Cluster</label>
                  <input
                    type="text"
                    placeholder="e.g. Max Super Speciality Hospital"
                    value={hospitalCluster}
                    onChange={(e) => setHospitalCluster(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 rounded-xl focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 rounded-xl focus:outline-none focus:border-emerald-600 capitalize"
                    >
                      <option value="canteen">Canteen</option>
                      <option value="food-court">Food Court</option>
                      <option value="pharmacy">Pharmacy</option>
                      <option value="beverage">Beverage</option>
                      <option value="snacks">Snacks</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Mobile Number</label>
                    <input
                      type="text"
                      placeholder="9876543210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 rounded-xl focus:outline-none focus:border-emerald-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Initial Password for Vendor</label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 rounded-xl font-mono focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-md disabled:opacity-50"
                  >
                    {formLoading ? 'Creating...' : 'Create Vendor Outlet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
