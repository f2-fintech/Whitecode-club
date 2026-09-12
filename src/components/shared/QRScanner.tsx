'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Camera, Keyboard, AlertCircle, RefreshCw } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (vendorCode: string) => void;
}

export default function QRScanner({ onScanSuccess }: QRScannerProps) {
  const [useCamera, setUseCamera] = useState<boolean>(true);
  const [manualCode, setManualCode] = useState<string>('');
  const [cameraError, setCameraError] = useState<string>('');
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    let html5QrcodeScanner: any = null;

    if (useCamera) {
      import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
        try {
          html5QrcodeScanner = new Html5QrcodeScanner(
            'reader',
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
            },
            /* verbose= */ false
          );

          scannerRef.current = html5QrcodeScanner;

          html5QrcodeScanner.render(
            (decodedText: string) => {
              let code = decodedText;
              try {
                const parsed = JSON.parse(decodedText);
                if (parsed.vendorCode) code = parsed.vendorCode;
              } catch {
                // Keep direct string
              }

              if (html5QrcodeScanner) {
                html5QrcodeScanner.clear().catch(console.error);
              }
              onScanSuccess(code);
            },
            () => {
              // Ignore frame scan errors
            }
          );
        } catch {
          setCameraError('Camera access unavailable or blocked. Please type vendor code below.');
          setUseCamera(false);
        }
      });
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [useCamera, onScanSuccess]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    onScanSuccess(manualCode.trim());
  };

  return (
    <div className="bg-white/90 border border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-200/50 text-center max-w-md w-full">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          {useCamera ? <Camera className="w-5 h-5 text-indigo-600" /> : <Keyboard className="w-5 h-5 text-emerald-600" />}
          {useCamera ? 'Scan Vendor QR Code' : 'Enter Vendor Code'}
        </h3>
        <button
          onClick={() => {
            if (scannerRef.current) {
              scannerRef.current.clear().catch(console.error);
            }
            setUseCamera(!useCamera);
          }}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {useCamera ? 'Enter Code Manually' : 'Use Camera'}
        </button>
      </div>

      {useCamera ? (
        <div>
          <div id="reader" className="w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 min-h-[280px]" />
          {cameraError && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}
          <p className="text-xs text-slate-500 mt-4">
            Point your camera at the vendor&apos;s White Coat Club QR code.
          </p>
        </div>
      ) : (
        <form onSubmit={handleManualSubmit} className="space-y-4 py-2">
          <div className="text-left">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Vendor Code
            </label>
            <input
              type="text"
              placeholder="e.g. F2-VEND-123456"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 text-slate-900 font-mono text-center text-lg px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 uppercase tracking-wider"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-semibold rounded-xl shadow-md transition-all text-sm"
          >
            Verify Vendor & Pay
          </button>
        </form>
      )}
    </div>
  );
}
