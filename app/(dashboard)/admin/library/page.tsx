'use client';

import { useState } from 'react';
import { reconcileLibraryDues } from '@/lib/actions';

export default function LibraryAdmin() {
  const [csvContent, setCsvContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [results, setResults] = useState<any[] | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      setFileName(file.name);
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 aether-card rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-5xl text-primary">
            upload_file
            </span>

            <h3 className="text-xl font-bold text-slate-900">Import Protocol</h3>
          </div>
          
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 font-medium">
              <p className="font-bold text-slate-700 mb-1">CSV Format Requirements:</p>
              <code>student_id, pending_books, fine_amount</code>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 hover:border-primary/50 transition-colors bg-slate-50/50">
              <span className="material-symbols-outlined text-4xl text-slate-300">upload_file</span>
              <p className="text-sm font-semibold">
              Drop CSV here or browse files
              </p>

              <p className="text-xs text-slate-400">
              Only .csv files are supported
              </p>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="ml-77 lock w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-indigo-700" />
              {fileName && (
                <p className="text-center text-sm font-semibold text-emerald-600">
                  ✓ {fileName}
                </p>
              )}
            </div>

            <button 
              onClick={handleReconcile}
              disabled={!csvContent || isPending}
              className="w-full py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
            >
              {isPending ? 'Processing Protocol...' : 'Process Library Records'}
            </button>
          </div>
        </div>

        <div className="aether-card rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary">analytics</span>
            <h3 className="text-xl font-bold text-slate-900">Synchronization Results</h3>
          </div>

          {!results ? (
            <div className="space-y-5">

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

                <p className="text-xs uppercase tracking-widest font-bold text-slate-400">
                  Current Status
                </p>

                <p className="mt-2 text-lg font-bold">
                  Waiting for CSV Upload
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  Upload the latest export from the library system to synchronize dues.
                </p>

              </div>

              <div className="rounded-xl border border-slate-200 p-5">

                <p className="font-bold mb-3">
                  This upload will
                </p>

                <ul className="space-y-2 text-sm text-slate-600">

                  <li>• Update pending books</li>

                  <li>• Update outstanding fines</li>

                  <li>• Create library dues automatically</li>

                  <li>• Preserve paid records</li>

                </ul>

              </div>

            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              <div className="p-4 bg-teal-50 border border-teal-100 rounded-xl mb-4">
                <p className="text-teal-700 text-xs font-bold uppercase tracking-wider">Library Synchronization Complete</p>
                <p className="text-teal-600 text-sm mt-1">{results.length} students records updated successfully.</p>
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
