'use client';

import { useState, useTransition } from 'react';
import { processFakePayment } from '@/lib/actions';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

export default function PaymentButton({ studentId }: { studentId: string }) {
  const [isPending, startTransition] = useTransition();
  const [qrData, setQrData] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const handlePayment = () => {
    startTransition(async () => {
      const res = await processFakePayment();
      if (res.success) {
        setQrData(res.qrData);
        setTransactionId(res.transactionId);
      }
    });
  };

  if (qrData) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-teal-50 border border-teal-100 rounded-2xl animate-in fade-in zoom-in duration-300 w-full">
        <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <h4 className="text-lg font-bold text-teal-900 mb-1">Payment Successful</h4>
        <p className="text-xs text-teal-700 mb-6 text-center">Your transaction was verified. Your clearance pipeline has been advanced.</p>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-teal-100 mb-6">
          <QRCodeSVG value={qrData} size={150} level="M" />
        </div>
        <div className="flex flex-col gap-3 w-full">
          <Link 
            href={`/receipt/${transactionId}`}
            className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold text-center text-sm shadow-lg shadow-teal-200 hover:bg-teal-700 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">receipt_long</span>
            View Official Receipt
          </Link>
          <p className="text-[10px] uppercase font-bold tracking-widest text-teal-600 text-center">TXN ID: {qrData}</p>
        </div>
      </div>
    );
  }

  return (
    <button 
      onClick={handlePayment} 
      disabled={isPending}
      className="w-full py-4 px-6 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isPending ? 'Processing...' : 'Pay Clearance Fee ($50)'}
      <span className="material-symbols-outlined text-lg">payment</span>
    </button>
  );
}
