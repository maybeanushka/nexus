'use client';

export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="print:hidden px-8 py-3 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-all">
      Download as PDF / Print
    </button>
  );
}
