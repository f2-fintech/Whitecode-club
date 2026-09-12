'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import { Plus, Edit2, Trash2, Tag, Utensils } from 'lucide-react';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
}

export default function VendorMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category: 'Food' });
  
  const fetchMenu = async () => {
    try {
      const res = await fetch('/api/vendor/menu');
      const data = await res.json();
      if (data.menuItems) setItems(data.menuItems);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/vendor/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({ name: '', description: '', price: '', category: 'Food' });
        setIsAdding(false);
        fetchMenu();
      }
    } catch (err) {
      console.error('Failed to add item', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const res = await fetch(`/api/vendor/menu/${id}`, { method: 'DELETE' });
      if (res.ok) fetchMenu();
    } catch (err) {
      console.error('Failed to delete item', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar userRole="vendor" />
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Menu Management</h1>
            <p className="text-sm text-slate-500 mt-1">Add or update items that doctors can order.</p>
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 font-semibold text-sm transition"
          >
            <Plus className="w-4 h-4" />
            {isAdding ? 'Cancel' : 'Add Item'}
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Item Name</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="e.g. Masala Dosa" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₹)</label>
              <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="e.g. 50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                <option value="Food">Food</option>
                <option value="Beverage">Beverage</option>
                <option value="Snacks">Snacks</option>
                <option value="Pharmacy">Pharmacy</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description (Optional)</label>
              <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="e.g. Served with chutney" />
            </div>
            <div className="sm:col-span-2 flex justify-end mt-2">
              <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700">Save Item</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-10 text-slate-500">Loading menu...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <Utensils className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No items found</h3>
            <p className="text-slate-500 text-sm">Add some items to start accepting pre-orders!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <div key={item._id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-slate-900">{item.name}</h3>
                  <div className="font-black text-emerald-600 font-mono text-lg">₹{item.price}</div>
                </div>
                {item.description && <p className="text-sm text-slate-500 mb-4">{item.description}</p>}
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <span className="flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                    <Tag className="w-3 h-3" /> {item.category}
                  </span>
                  
                  <button onClick={() => handleDelete(item._id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition" title="Delete Item">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
