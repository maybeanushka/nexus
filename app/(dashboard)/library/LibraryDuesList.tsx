'use client';

import { payDuesAction } from '@/lib/actions';
import { useState } from 'react';

export default function LibraryDuesList({ dues, studentId }: { dues: any[], studentId: string }) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handlePay = async (dueId: string) => {
    setIsProcessing(dueId);
    const res = await payDuesAction(studentId, dueId);
    if (res.success) {
      window.location.href = `/receipt/${res.transactionId}`;
    }
    setIsProcessing(null);
  };

  if (dues.length === 0) {
    return (
      <div className="aether-card rounded-2xl p-20 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-4xl">check_circle</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900">Protocol Clear</h3>
        <p className="text-slate-500 text-sm max-w-xs mt-2">No pending books or fines detected in your library record.</p>
      </div>
    );
  }

  return (
    <div className="aether-card rounded-2xl overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="px-8 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Record Details</th>
            <th className="px-8 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Amount</th>
            <th className="px-8 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Status</th>
            <th className="px-8 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {dues.map((due) => (
            <tr key={due._id.toString()} className="group hover:bg-slate-50/50 transition-colors">
              <td className="px-8 py-6">
                <p className="font-bold text-slate-900">{due.details}</p>
                <p className="text-[10px] text-slate-400 font-medium uppercase mt-1">Ref ID: {due._id.toString().substring(0, 8)}</p>
              </td>
              <td className="px-8 py-6 font-black text-slate-900">₹{due.amount}</td>
              <td className="px-8 py-6">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  due.status === 'paid' ? 'bg-teal-50 text-teal-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  {due.status}
                </span>
              </td>
              <td className="px-8 py-6 text-right">
                {due.status === 'pending' && (
                  <button 
                    onClick={() => handlePay(due._id.toString())}
                    disabled={isProcessing === due._id.toString()}
                    className="px-6 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-primary transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isProcessing === due._id.toString() ? 'Syncing...' : 'Pay Now'}
                  </button>
                )}
                {due.status === 'paid' && due.transaction_id && (
                  <a 
                    href={`/receipt/${due.transaction_id}`}
                    className="px-6 py-2 bg-teal-50 text-teal-600 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-teal-100 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">receipt_long</span>
                    Receipt
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
