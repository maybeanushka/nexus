'use client';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-indigo-700 active:scale-95"
    >
      <span className="material-symbols-outlined text-[20px]">
        download
      </span>
      Download PDF
    </button>
  );
}