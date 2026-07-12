import { getSession } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Due } from '@/lib/models';
import { redirect } from 'next/navigation';
import PayAllButton from './PayAllButton';

export default async function FeesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  await dbConnect();
  const dues = await Due.find({ student_id: session.userId }).lean() as any[];
  
  // Group dues by type
  const libraryTotal = dues.filter(d => d.type === 'library' && d.status === 'pending').reduce((a, b) => a + b.amount, 0);
  const hostelTotal = dues.filter(d => d.type === 'hostel' && d.status === 'pending').reduce((a, b) => a + b.amount, 0);
  const miscTotal = dues.filter(d => d.type === 'misc' && d.status === 'pending').reduce((a, b) => a + b.amount, 0);
  const totalPayable = libraryTotal + hostelTotal + miscTotal;

  return (
    <section>
      <div className="mb-8">
        <h2 className="text-4xl font-black tracking-tight text-on-surface mb-2">Financial Dashboard</h2>
        <p className="text-on-surface-variant text-lg">Detailed breakdown of all institutional dues and settlement history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="aether-card rounded-2xl p-8">
            <h3 className="text-xl font-black mb-4 border-b border-slate-100 pb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
              Dues Breakdown
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-6 hover:border-primary/20 hover:shadow-md transition">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
                    <span className="material-symbols-outlined text-amber-600">
                      menu_book
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900">
                      Library Fines
                    </h4>

                    <p className="text-sm text-slate-500">
                      Pending Records
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                      libraryTotal > 0
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {libraryTotal > 0 ? "Pending" : "Cleared"}
                  </span>

                  <p className="mt-2 text-3xl font-black">
                    ₹{libraryTotal}
                  </p>
                </div>

              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-6 hover:border-primary/20 hover:shadow-md transition">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">
                    <span className="material-symbols-outlined text-indigo-600">
                      apartment
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900">
                      Hostel & Repair Charges
                    </h4>

                    <p className="text-sm text-slate-500">
                      Calculated Dues
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                      hostelTotal > 0
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {hostelTotal > 0 ? "Pending" : "Cleared"}
                  </span>

                  <p className="mt-2 text-3xl font-black">
                    ₹{hostelTotal}
                  </p>
                </div>

              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-6 hover:border-primary/20 hover:shadow-md transition">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
                    <span className="material-symbols-outlined text-emerald-600">
                      receipt_long
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900">
                      Library Fines
                    </h4>

                    <p className="text-sm text-slate-500">
                      Pending Records
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                      miscTotal > 0
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {miscTotal > 0 ? "Pending" : "Cleared"}
                  </span> 

                  <p className="mt-2 text-3xl font-black">
                    ₹{miscTotal}
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="aether-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">
                account_balance_wallet
              </span>

              <h3 className="text-xl font-bold">
                Payment Summary
              </h3>
            </div>
            <div className="space-y-4 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-medium">Subtotal Dues</span>
                <span className="text-slate-900 font-bold">₹{totalPayable}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-medium">Processing Fee</span>
                <span className="text-slate-900 font-bold">₹0.00</span>
              </div>
              <div className="mt-2 rounded-xl bg-primary/5 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">
                    Total Payable
                  </span>

                  <span className="text-3xl font-black text-primary">
                    ₹{totalPayable}
                  </span>
                </div>
              </div>
            </div>
            <PayAllButton totalPayable={totalPayable} />
          </div>

          <div className="aether-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-primary">
                receipt_long
              </span>

              <h3 className="text-lg font-bold">
                Recent Payments
              </h3>
            </div>

            {dues.some(d => d.status === "paid") ? (
              dues
                .filter(d => d.status === "paid")
                .slice(0, 3)
                .map(d => (
                  <div
                    key={d._id}
                    className="flex items-center justify-between py-3 border-b last:border-0"
                  >
                    <div>
                      <p className="font-semibold capitalize">
                        {d.type}
                      </p>

                      <p className="text-sm text-slate-500">
                        ₹{d.amount}
                      </p>
                    </div>

                    <a
                      href={`/receipt/${d.transaction_id}`}
                      className="text-primary font-medium text-sm hover:underline"
                    >
                      Receipt
                    </a>
                  </div>
                ))
            ) : (
              <div className="text-center py-6">
                <span className="material-symbols-outlined text-4xl text-slate-300">
                  receipt_long
                </span>

                <p className="mt-3 font-semibold text-slate-600">
                  No payments yet
                </p>

                <p className="text-sm text-slate-500">
                  Completed transactions will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
