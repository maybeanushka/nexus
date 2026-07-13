'use client';

import { reviewApplication } from '@/lib/actions';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function ReviewForm({ applicationId, currentNotes }: { applicationId: string, currentNotes: string }) {
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
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center animate-in zoom-in-95 duration-300">

        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600 text-white">
          <span className="material-symbols-outlined text-5xl">
            task_alt
          </span>
        </div>

        <h2 className="text-2xl font-black text-emerald-800">
          Application Approved Successfully
        </h2>

        <p className="mt-3 text-slate-600">
          The review has been completed successfully.
        </p>

        <p className="mt-2 text-sm text-slate-500">
          This application has been forwarded to the next approval stage.
        </p>

        <div className="mt-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow">
            <span className="material-symbols-outlined">
              sync
            </span>
            Redirecting...
          </div>
        </div>

      </div>
    );
  }

  return (
    <form className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2 group">
        <label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 px-1">Review Remarks</label>
        <textarea 
          name="notes" 
          defaultValue={currentNotes || ''}
          rows={5} 
          className="block w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-300 focus:border-primary focus:ring-0 transition-all outline-none resize-none group-hover:border-slate-200" 
          placeholder="Enter remarks for this review (optional for approval, recommended for rejection)..."
        ></textarea>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <button 
          type="button"
          onClick={() => handleReview('approved', new FormData(document.querySelector('form')!))}
          disabled={isPending} 
          className="flex-1 py-4 px-6 bg-teal-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-teal-100 hover:bg-teal-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group/btn" 
        >
          {isPending ? 'Syncing...' : 'Approve Application'}
          <span className="material-symbols-outlined text-lg transition-transform group-hover/btn:scale-110">verified</span>
        </button>
        <button 
          type="button"
          onClick={() => handleReview('rejected', new FormData(document.querySelector('form')!))}
          disabled={isPending} 
          className="flex-1 py-4 px-6 bg-rose-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-rose-100 hover:bg-rose-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group/btn" 
        >
          {isPending ? 'Submitting...' : 'Reject Application'}
          <span className="material-symbols-outlined text-lg transition-transform group-hover/btn:rotate-12">error</span>
        </button>
      </div>
    </form>
  );
}
