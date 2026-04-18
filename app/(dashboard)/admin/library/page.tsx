'use client';

import { useState } from 'react';
import { reconcileLibraryDues } from '@/lib/actions';

export default function LibraryAdmin() {
  const [csvContent, setCsvContent] = useState('');
  const [results, setResults] = useState<any[] | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setCsvContent(ev.target?.result as string);
      reader.readAsText(file);
    }
  };

  const handleReconcile = async () => {
    if (!csvContent) return;
    setIsPending(true);
    const res = await reconcileLibraryDues(csvContent);
    setResults(res);
    setIsPending(false);
  };

  return (
    <section>
      <div className="mb-10">
        <h2 className="text-4xl font-black tracking-tight text-on-surface mb-2">Library Reconciliation</h2>
        <p className="text-on-surface-variant text-lg">Upload CSV flat-files to synchronize student library dues and pending books.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="aether-card rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary">upload_file</span>
            <h3 className="text-xl font-bold text-slate-900">Import Protocol</h3>
          </div>
          
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 font-medium">
              <p className="font-bold text-slate-700 mb-1">CSV Format Requirements:</p>
              <code>student_id, pending_books, fine_amount</code>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 hover:border-primary/50 transition-colors bg-slate-50/50">
              <span className="material-symbols-outlined text-4xl text-slate-300">csv</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-indigo-700" />
            </div>

            <button 
              onClick={handleReconcile}
              disabled={!csvContent || isPending}
              className="w-full py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
            >
              {isPending ? 'Processing Protocol...' : 'Initialize Reconciliation'}
            </button>
          </div>
        </div>

        <div className="aether-card rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary">analytics</span>
            <h3 className="text-xl font-bold text-slate-900">Process Summary</h3>
          </div>

          {!results ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-300 gap-2">
              <span className="material-symbols-outlined text-4xl">inventory_2</span>
              <p className="text-sm font-medium">Awaiting file input...</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              <div className="p-4 bg-teal-50 border border-teal-100 rounded-xl mb-4">
                <p className="text-teal-700 text-xs font-bold uppercase tracking-wider">Synchronization Complete</p>
                <p className="text-teal-600 text-sm mt-1">{results.length} students processed and flagged.</p>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
                    <th className="pb-3">Student ID</th>
                    <th className="pb-3">Books</th>
                    <th className="pb-3">Fine</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {results.map((r, i) => (
                    <tr key={i} className="text-sm font-bold text-slate-700">
                      <td className="py-3">{r.studentId}</td>
                      <td className="py-3">{r.books}</td>
                      <td className="py-3 text-rose-600">₹{r.fine}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
