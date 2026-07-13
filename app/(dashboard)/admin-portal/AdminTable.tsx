'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { bulkApprove } from '@/lib/actions';
import { useRouter } from 'next/navigation';

export default function AdminTable({ applications, adminRole }: { applications: any[], adminRole: string }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const toggleSelectAll = () => {
    if (selected.length === applications.length) {
      setSelected([]);
    } else {
      setSelected(applications.map(a => a.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleBulkApprove = () => {
    if (selected.length === 0) return;
    startTransition(async () => {
      await bulkApprove(selected);
      setSelected([]);
      router.refresh();
    });
  };

  if (applications.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 py-20 text-center">

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <span className="material-symbols-outlined text-5xl text-emerald-600">
            task_alt
          </span>
        </div>

        <h3 className="text-2xl font-black text-slate-900">
          You're all caught up!
        </h3>

        <p className="mx-auto mt-3 max-w-md text-slate-500">
          There are currently no student applications awaiting your review.
          New submissions will automatically appear here.
        </p>

      </div>
    );
  }

  return (
    <div className="relative">
      {/* Floating Bulk Action Bar - Only shows when 2 or more are selected */}
      <div className={`sticky top-4 z-30 mb-6 transition-all duration-500 ease-out transform ${selected.length > 1 ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex justify-between items-center border border-white/10">
          <div className="flex items-center gap-4 pl-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black text-xs">
              {selected.length}
            </div>
            <span className="text-sm font-bold tracking-tight">Protocol instances selected for batch approval</span>
          </div>
          <button 
            onClick={handleBulkApprove} 
            disabled={isPending}
            className="px-6 py-2 bg-primary hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {isPending ? 'Processing Batch...' : 'Execute Bulk Approval'}
            <span className="material-symbols-outlined text-[18px]">done_all</span>
          </button>
        </div>
      </div>

      <div className="overflow-hidden aether-card rounded-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="py-5 px-6 w-12 text-center">
                <input 
                  type="checkbox" 
                  checked={selected.length === applications.length && applications.length > 0}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 accent-primary rounded-lg cursor-pointer"
                />
              </th>
              <th className="py-5 px-4 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">Student Identity</th>
              <th className="py-5 px-4 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">Protocol Status</th>
              <th className="py-5 px-4 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">Submission Node</th>
              <th className="py-5 px-4 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 text-right">Review Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {applications.map((app, index) => {
              let currentStageStatus = 'pending';
              if (adminRole === 'lab_admin') currentStageStatus = app.lab_status;
              if (adminRole === 'hod_admin') currentStageStatus = app.hod_status;
              if (adminRole === 'principal_admin') currentStageStatus = app.principal_status;

              return (
                <tr key={app.id} className={`group transition-all duration-300 hover:bg-slate-50/80 ${selected.includes(app.id) ? 'bg-primary/5' : ''}`}>
                  <td className="py-5 px-6 text-center">
                    <input 
                      type="checkbox" 
                      checked={selected.includes(app.id)}
                      onChange={() => toggleSelect(app.id)}
                      className="w-5 h-5 accent-primary rounded-lg cursor-pointer transition-transform group-hover:scale-110"
                    />
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs uppercase">
                        {app.student_name
                        .split(" ")
                        .map((n: string) => n[0])
                        .slice(0,2)
                        .join("")
                        .toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors">{app.student_name}</div>
                        <div className="text-xs text-slate-400 font-medium">{app.student_email}
                          <p className="text-[11px] text-slate-400 font-mono mt-1">
                          #{app.id.slice(-6).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <span className={`status-badge inline-flex items-center gap-1 ${
                      currentStageStatus === 'approved' ? 'bg-teal-50 text-teal-700' : 
                      currentStageStatus === 'rejected' ? 'bg-rose-50 text-rose-700' : 
                      'bg-indigo-50 text-primary'
                    }`}>
                      <span className="w-1 h-1 rounded-full bg-current"></span>
                      {currentStageStatus === "pending"
                      ? "Pending Review"
                      : currentStageStatus === "approved"
                      ? "Approved"
                      : "Rejected"}
                    </span>
                  </td>
                  <td className="py-5 px-8 text-sm text-slate-500 font-bold">
                    {new Intl.DateTimeFormat("en-GB",{
                    day:"2-digit",
                    month:"short",
                    year:"numeric"
                  }).format(new Date(app.submitted_at))}
                  </td>
                  <td className="py-5 px-4 text-right">
                    <Link href={`/admin-portal/review/${app.id}`} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white border border-primary text-slate-700 hover:bg-indigo-700 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm hover:shadow-md group/btn">
                      Review 
                      <span className="material-symbols-outlined text-[16px] transition-transform group-hover/btn:translate-x-1">arrow_forward</span>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
