'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, QrCode, Store, Building2, Tag } from 'lucide-react';

interface QRDisplayProps {
  vendorCode: string;
  vendorName: string;
  category: string;
  hospitalCluster: string;
}

export default function QRDisplay({
  vendorCode,
  vendorName,
  category,
  hospitalCluster,
}: QRDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (vendorCode) {
      QRCode.toDataURL(vendorCode, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      }).then(setQrDataUrl);
    }
  }, [vendorCode]);

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${vendorName.replace(/\s+/g, '_')}_QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 sm:p-8 text-center max-w-md w-full shadow-xl shadow-slate-200/50 relative overflow-hidden group">
      {/* Background glow effect */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-500" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-500" />

      {/* Header */}
      <div className="flex items-center justify-center space-x-2 text-indigo-600 font-semibold mb-2">
        <QrCode className="w-5 h-5" />
        <span className="text-sm tracking-wider uppercase">F2 White Coat Club QR</span>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center justify-center gap-2">
        <Store className="w-6 h-6 text-indigo-600" />
        {vendorName}
      </h2>

      <div className="flex items-center justify-center gap-3 text-xs text-slate-600 mt-2">
        <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
          {hospitalCluster}
        </span>
        <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 capitalize">
          <Tag className="w-3.5 h-3.5 text-emerald-600" />
          {category}
        </span>
      </div>

      {/* QR Code Container */}
      <div className="my-6 p-4 bg-white rounded-2xl inline-block shadow-md border-2 border-slate-100">
        {qrDataUrl ? (
          <img src={qrDataUrl} alt={`QR Code for ${vendorName}`} className="w-56 h-56 mx-auto object-contain" />
        ) : (
          <div className="w-56 h-56 flex items-center justify-center text-slate-400">
            Generating QR...
          </div>
        )}
      </div>

      {/* Code Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 mb-5 inline-flex items-center gap-2">
        <span className="text-xs text-slate-500 font-medium">Vendor Code:</span>
        <span className="text-base font-mono font-bold text-indigo-700 tracking-wider">{vendorCode}</span>
      </div>

      <p className="text-xs text-slate-500 mb-6">
        Display this QR at your counter for verified doctors to scan and pay.
      </p>

      {/* Action button */}
      <button
        onClick={downloadQR}
        disabled={!qrDataUrl}
        className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
      >
        <Download className="w-4 h-4" />
        Download QR Code
      </button>
    </div>
  );
}
