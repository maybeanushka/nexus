'use client';

import { reviewApplication } from '@/lib/actions';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function ReviewForm({ applicationId, currentNotes, adminId, adminRole }: { applicationId: string, currentNotes: string, adminId: string, adminRole: string }) {
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleReview = (status: 'approved' | 'rejected', formData: FormData) => {
    const notes = formData.get('notes') as string;
    startTransition(async () => {
      try {
        await reviewApplication(applicationId, status, notes);
        setIsSuccess(true);
        // Short delay to show success state before navigating
        setTimeout(() => {
          router.push('/admin-portal');
          router.refresh();
        }, 1000);
      } catch (e) {
        console.error(e);
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="p-10 text-center space-y-4 animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <span className="material-symbols-outlined text-4xl">check_circle</span>
        </div>
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Decision Recorded</h3>
        <p className="text-slate-500 text-sm font-medium">The protocol has been updated. Returning to terminal...</p>
      </div>
    );
  }

  return (
    <form className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2 group">
        <label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 px-1">Registrar Protocol Notes</label>
        <textarea 
          name="notes" 
          defaultValue={currentNotes || ''}
          rows={5} 
          className="block w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-300 focus:border-primary focus:ring-0 transition-all outline-none resize-none group-hover:border-slate-200" 
          placeholder="State reason for decision or instructions for student..."
        ></textarea>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          type="button"
          onClick={() => handleReview('approved', new FormData(document.querySelector('form')!))}
          disabled={isPending} 
          className="flex-1 py-4 px-6 bg-teal-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-teal-100 hover:bg-teal-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group/btn" 
        >
          {isPending ? 'Syncing...' : 'Approve Protocol'}
          <span className="material-symbols-outlined text-lg transition-transform group-hover/btn:scale-110">verified</span>
        </button>
        <button 
          type="button"
          onClick={() => handleReview('rejected', new FormData(document.querySelector('form')!))}
          disabled={isPending} 
          className="flex-1 py-4 px-6 bg-rose-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-rose-100 hover:bg-rose-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group/btn" 
        >
          {isPending ? 'Syncing...' : 'Issue Protocol Rejection'}
          <span className="material-symbols-outlined text-lg transition-transform group-hover/btn:rotate-12">error</span>
        </button>
      </div>
    </form>
  );
}
