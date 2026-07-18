'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { bulkApprove, bulkReject } from '@/lib/actions';
import { useRouter } from 'next/navigation';

export default function AdminTable({ applications, adminRole }: { applications: any[], adminRole: string }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const toggleSelectAll = () => {
    if (selected.length === filteredApplications.length) {
      setSelected([]);
    } else {
      setSelected(filteredApplications.map((a) => a.id));
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

  const handleBulkReject = () => {
    if (selected.length < 2) return;

    startTransition(async () => {
      await bulkReject(selected);
      setSelected([]);
      router.refresh();
    });
  };

  const getCurrentStatus = (app: any) => {
    if (adminRole === "lab_admin") return app.lab_status;
    if (adminRole === "hod_admin") return app.hod_status;
    if (adminRole === "principal_admin") return app.principal_status;
    return "pending";
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.student_name.toLowerCase().includes(search.toLowerCase()) ||
      app.student_email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      getCurrentStatus(app) === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
      <div
        className={`mt-3 mb-6 transition-all duration-300 ${
          selected.length > 1 ? "block" : "hidden"
        }`}
      >
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex justify-between items-center border border-white/10">
          <div className="flex items-center gap-4 pl-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black text-xs">
              {selected.length}
            </div>
            <span className="text-sm font-bold tracking-tight">{selected.length} applications selected</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleBulkApprove}
              disabled={isPending}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white font-bold"
            >
              Bulk Approve
            </button>

            <button
              onClick={handleBulkReject}
              disabled={isPending}
              className="px-6 py-2 bg-rose-600 hover:bg-rose-700 rounded-xl text-white font-bold disabled:opacity-50"
            >
              Bulk Reject
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 mb-5 flex flex-col md:flex-row justify-between gap-4">

        <input
          type="text"
          placeholder="Search student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-2 text-sm"
        />
      </div>

      <div className="overflow-hidden aether-card rounded-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="py-5 px-6 w-12 text-center">
                <input 
                  type="checkbox" 
                  checked={selected.length === filteredApplications.length && filteredApplications.length > 0}
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
            {filteredApplications.map((app, index) => {
              const currentStageStatus = getCurrentStatus(app);

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
