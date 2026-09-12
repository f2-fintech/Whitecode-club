'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingBag, Plus, Minus } from 'lucide-react';
import Link from 'next/link';

export default function DoctorVendorMenuPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const vendorId = params.id;

  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [vendorDetails, setVendorDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ [key: string]: { item: any, quantity: number } }>({});
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vRes, mRes] = await Promise.all([
          fetch('/api/doctor/vendors'), // simple hack to find vendor details from the list
          fetch(`/api/doctor/vendors/${vendorId}/menu`)
        ]);

        const vData = await vRes.json();
        const mData = await mRes.json();

        if (vData.vendors) {
          const v = vData.vendors.find((x: any) => x._id === vendorId);
          setVendorDetails(v);
        }
        if (mData.menuItems) {
          setMenuItems(mData.menuItems);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vendorId]);

  const updateCart = (item: any, delta: number) => {
    setCart(prev => {
      const newCart = { ...prev };
      const currentQty = newCart[item._id]?.quantity || 0;
      const nextQty = currentQty + delta;
      
      if (nextQty <= 0) {
        delete newCart[item._id];
      } else {
        newCart[item._id] = { item, quantity: nextQty };
      }
      return newCart;
    });
  };

  const cartValues = Object.values(cart);
  const totalItems = cartValues.reduce((sum, c) => sum + c.quantity, 0);
  const totalPrice = cartValues.reduce((sum, c) => sum + (c.item.price * c.quantity), 0);

  const handleCheckout = async () => {
    if (totalItems === 0) return;
    setProcessing(true);
    
    try {
      const payload = {
        vendorId,
        items: cartValues.map(c => ({
          menuItemId: c.item._id,
          quantity: c.quantity
        }))
      };

      const res = await fetch('/api/doctor/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      if (res.ok) {
        alert('Order placed successfully! Keep an eye on your Orders tab.');
        router.push('/doctor/dashboard'); // Or push to history/orders page
      } else {
        alert(data.error || 'Failed to place order');
      }
    } catch (err) {
      alert('Error placing order');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar userRole="doctor" />
        <div className="py-20 text-center text-slate-500">Loading menu...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar userRole="doctor" />

      <main className="max-w-md mx-auto w-full flex-1 bg-white sm:border-x sm:border-slate-200 shadow-xl relative pb-28">
        
        {/* Vendor Header */}
        <div className="bg-slate-900 text-white p-4 sticky top-0 z-10 flex items-center gap-4">
          <Link href="/doctor/dashboard" className="p-2 bg-white/10 rounded-full hover:bg-white/20">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">{vendorDetails?.name || 'Vendor Menu'}</h1>
            <p className="text-xs text-slate-300">{vendorDetails?.category?.toUpperCase()} • {vendorDetails?.hospitalCluster}</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-6">
          {menuItems.length === 0 ? (
             <div className="text-center py-10 text-slate-500">This vendor hasn't added any menu items yet.</div>
          ) : (
            menuItems.map(item => {
              const qty = cart[item._id]?.quantity || 0;
              return (
                <div key={item._id} className="flex justify-between items-start border-b border-slate-100 pb-6">
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-3 h-3 border rounded-sm flex items-center justify-center ${item.category.toLowerCase() === 'food' ? 'border-emerald-500 text-emerald-500' : 'border-rose-500 text-rose-500'}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                      </span>
                      <h3 className="font-bold text-slate-900">{item.name}</h3>
                    </div>
                    <div className="font-semibold text-slate-700 text-sm mb-1">₹{item.price}</div>
                    {item.description && <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>}
                  </div>
                  
                  <div className="shrink-0 mt-2 relative">
                    <div className="w-24 h-24 bg-slate-100 rounded-xl mb-3 shadow-sm border border-slate-200 flex items-center justify-center">
                      <span className="text-slate-300 font-bold text-xs">No Image</span>
                    </div>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white shadow-md rounded-lg border border-rose-100 overflow-hidden flex items-center text-rose-600 font-bold h-8">
                      {qty === 0 ? (
                        <button onClick={() => updateCart(item, 1)} className="px-6 py-1 hover:bg-rose-50 w-full">ADD</button>
                      ) : (
                        <>
                          <button onClick={() => updateCart(item, -1)} className="px-2.5 py-1 hover:bg-rose-50"><Minus className="w-3.5 h-3.5" /></button>
                          <span className="px-2 text-sm">{qty}</span>
                          <button onClick={() => updateCart(item, 1)} className="px-2.5 py-1 hover:bg-rose-50"><Plus className="w-3.5 h-3.5" /></button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Floating Cart Checkout Button */}
        {totalItems > 0 && (
          <div className="fixed sm:absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
            <button 
              onClick={handleCheckout}
              disabled={processing}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl p-4 flex items-center justify-between font-bold shadow-lg shadow-emerald-600/30 transition-transform active:scale-95 disabled:opacity-70"
            >
              <div className="flex flex-col text-left">
                <span className="text-xs text-emerald-100">{totalItems} ITEM{totalItems > 1 ? 'S' : ''}</span>
                <span className="text-lg">₹{totalPrice}</span>
              </div>
              <div className="flex items-center gap-2">
                {processing ? 'Processing...' : 'Pre-order Now'} <ShoppingBag className="w-5 h-5" />
              </div>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
