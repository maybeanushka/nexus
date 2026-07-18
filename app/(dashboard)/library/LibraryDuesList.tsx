'use client';

import { payDuesAction } from '@/lib/actions';
import { useState } from 'react';
import { useRouter } from "next/navigation";

export default function LibraryDuesList({ dues }: { dues: any[] }) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const router = useRouter();

  const handlePay = async (dueId: string) => {
    setIsProcessing(dueId);
    const res = await payDuesAction(dueId);
    if (res.success) {
      router.push(`/receipt/${res.transactionId}`);
    }
    setIsProcessing(null);
  };

  if (dues.length === 0) {
    return (
      <div className="aether-card rounded-2xl p-20 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-4xl">check_circle</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900">Library Cleared</h3>
        <p className="text-slate-500 text-sm max-w-xs mt-2">No pending books or library fines.<br></br>Your library verification is complete.</p>
      </div>
    );
  }

  return (
    <div className="aether-card rounded-2xl overflow-hidden">
      <div className="p-6 space-y-6">
        {dues.map((due) => (
          <div
            key={due._id.toString()}
            className="rounded-2xl border border-slate-200 p-6 hover:border-primary/30 hover:shadow-md transition"
          >

            <div>
              {due.books && due.books.length > 0 ? (
                <>
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-lg font-bold">
                      Borrowed Books
                    </h3>

                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                      {due.books.length} Book{due.books.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {due.books.map((book: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 rounded-xl py-5 px-2 transition hover:bg-slate-100"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                          <span className="material-symbols-outlined text-primary">
                            menu_book
                          </span>
                        </div>

                        <div>
                          <p className="font-bold text-slate-900">
                            {book.title}
                          </p>

                          <p className="text-sm text-slate-500">
                            {book.author}
                          </p>

                          <p className="mt-1 text-xs font-bold text-rose-500">
                            Due:{" "}
                            {new Intl.DateTimeFormat("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }).format(new Date(book.due_date))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <span className="material-symbols-outlined text-primary">
                        description
                      </span>
                    </div>

                    <h3 className="text-lg font-bold">
                      Due Details
                    </h3>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-primary/5 p-4">
                    <p className="text-sm font-bold text-slate-700">
                      {due.details || "No additional details available."}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <span className="material-symbols-outlined">
                    receipt_long
                  </span>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Outstanding Due
                  </p>

                  <p className="text-3xl font-black tracking-tight">
                    ₹{due.amount}
                  </p>
                  
                </div>
              </div>

              <span
                className={`rounded-full px-4 py-2 text-xs font-bold ${
                  due.status === 'paid'
                    ? 'bg-teal-100 text-teal-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {due.status === 'paid' ? 'Paid' : 'Payment Pending'}
              </span>

              {due.status === 'pending' ? (
                <button
                  onClick={() => handlePay(due._id.toString())}
                  disabled={isProcessing===due._id.toString()}
                  className="rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {isProcessing===due._id.toString()
                    ? 'Processing...'
                    : `Proceed to payment`}
                </button>
              ) : (
                <a
                  href={`/receipt/${due.transaction_id}`}
                  className="rounded-xl bg-teal-100 px-5 py-3 font-semibold text-teal-700 hover:bg-teal-200 transition"
                >
                  Receipt
                </a>
              )}

            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
