'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import { RefreshCw, CheckCircle2, Clock, PlayCircle, XCircle } from 'lucide-react';

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/vendor/orders');
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/vendor/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar userRole="vendor" />
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Live Pre-orders</h1>
            <p className="text-sm text-slate-500 mt-1">Manage incoming food/takeaway orders.</p>
          </div>
          <button 
            onClick={() => { setLoading(true); fetchOrders(); }}
            className="flex items-center gap-2 text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-xl font-semibold text-sm transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {loading && orders.length === 0 ? (
          <div className="text-center py-10 text-slate-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800">No active orders</h3>
            <p className="text-slate-500 text-sm">New orders will appear here automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">Dr. {order.doctorId?.name}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">Order #{order._id.slice(-6).toUpperCase()} • {new Date(order.createdAt).toLocaleTimeString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-emerald-600 text-xl">₹{order.totalAmount}</div>
                    <div className={`text-xs font-bold uppercase mt-1 px-2 py-0.5 rounded ${
                      order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      order.status === 'preparing' ? 'bg-indigo-100 text-indigo-700' :
                      order.status === 'ready' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {order.status}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Items</h4>
                  <ul className="space-y-1">
                    {order.items.map((item: any, idx: number) => (
                      <li key={idx} className="flex justify-between text-sm">
                        <span className="font-medium text-slate-800">{item.quantity}x {item.name}</span>
                        <span className="text-slate-500">₹{item.price * item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {order.status !== 'completed' && order.status !== 'cancelled' && (
                  <div className="flex gap-2 justify-end mt-4 pt-4 border-t border-slate-100">
                    {order.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(order._id, 'cancelled')} className="flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100">
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                        <button onClick={() => updateStatus(order._id, 'preparing')} className="flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                          <PlayCircle className="w-4 h-4" /> Accept & Prepare
                        </button>
                      </>
                    )}
                    {order.status === 'preparing' && (
                      <button onClick={() => updateStatus(order._id, 'ready')} className="flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
                        <CheckCircle2 className="w-4 h-4" /> Mark as Ready
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button onClick={() => updateStatus(order._id, 'completed')} className="flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900">
                        Handed Over (Complete)
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
