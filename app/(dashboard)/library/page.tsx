import { getSession } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Due } from '@/lib/models';
import { redirect } from 'next/navigation';
import LibraryDuesList from './LibraryDuesList';

export default async function LibraryPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  await dbConnect();
  const pendingDues = await Due.find({
  student_id: session.userId,
  type: 'library',
  status: 'pending'
}).lean() as any[];

const paidDues = await Due.find({
  student_id: session.userId,
  type: 'library',
  status: 'paid'
})
.sort({ updatedAt: -1 })
.lean() as any[];

  const pendingBooks = pendingDues.flatMap(d => d.books || []);
  const nextDueBook =
    pendingBooks.length > 0
      ? pendingBooks.sort(
          (a, b) =>
            new Date(a.due_date).getTime() -
            new Date(b.due_date).getTime()
        )[0]
      : null;
  let daysRemaining = 0;
  if (nextDueBook) {
    const today = new Date();
    today.setHours(0,0,0,0);
    const due = new Date(nextDueBook.due_date);
    due.setHours(0,0,0,0);
    daysRemaining = Math.ceil(
      (due.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
    );
  }
  const totalFine = pendingDues
  .filter(due => due.status === 'pending')
  .reduce((sum, due) => sum + due.amount, 0);

  return (
    <section>
      <div className="mb-10">
        <h2 className="text-4xl font-black tracking-tight text-on-surface mb-2">Institutional Library</h2>
        <p className="text-on-surface-variant text-lg">Review pending books, accumulated fines, and settle your library payments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <LibraryDuesList dues={pendingDues} />
          <div className="grid md:grid-cols-2 gap-6">
              {
                <div className="aether-card rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    checklist
                  </span>
                  Clearance Progress
                </h3>
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">Return Books</p>
                      <p className="text-xs text-slate-500">
                        Return all issued library books.
                      </p>
                    </div>
                    <span
                      className={`material-symbols-outlined ${
                        pendingDues.some(d => d.books?.length)
                          ? 'text-amber-500'
                          : 'text-emerald-500'
                      }`}
                    >
                      {pendingDues.some(d => d.books?.length)
                        ? 'pending'
                        : 'check_circle'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">Pay Fine</p>
                      <p className="text-xs text-slate-500">
                        Clear any outstanding library fines.
                      </p>
                    </div>
                    <span
                      className={`material-symbols-outlined ${
                        pendingDues.some(d => d.status === 'pending')
                          ? 'text-amber-500'
                          : 'text-emerald-500'
                      }`}
                    >
                      {pendingDues.some(d => d.status === 'pending')
                        ? 'pending'
                        : 'check_circle'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">Library Verification</p>
                      <p className="text-xs text-slate-500">
                        Await verification from the library.
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-slate-400">
                      schedule
                    </span>
                  </div>
                </div>
              </div>
              }
              {
                <div className="aether-card rounded-2xl p-6">
                  <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">
                          receipt_long
                      </span>
                      Recent Payment
                  </h3>
                  {paidDues.length > 0 ? (
                      <div className="space-y-3">
                          {paidDues.slice(0,1)
                              .map(d=>(
                                  <div key={d._id}>
                                      <p className="font-bold">
                                          ₹{d.amount}
                                      </p>
                                      <p className="text-sm text-slate-500">
                                          Payment Successful
                                      </p>
                                      <a
                                          href={`/receipt/${d.transaction_id}`}
                                          className="inline-flex items-center gap-2 text-primary text-sm font-semibold mt-3"
                                      >
                                          View Receipt
                                          <span className="material-symbols-outlined text-sm">
                                              arrow_forward
                                          </span>
                                      </a>
                                  </div>
                              ))}
                      </div>
                  ) : (
                      <div className="text-sm text-slate-500">
                          No payments have been made yet.
                      </div>
                  )}
              </div>
              }
          </div>

      </div>
        
        <div className="space-y-3">
            <div className="aether-card rounded-2xl p-3 mb-3">
              <h3 className="text-base font-bold flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-primary">
                  schedule
                </span>
                Next Due Date
              </h3>
              {nextDueBook ? (
                <>
                  <p
                    className={`mt-2 text-xl px-22 font-black ${
                      daysRemaining < 3
                        ? 'text-rose-600'
                        : daysRemaining <= 7
                        ? 'text-amber-500'
                        : 'text-teal-600'
                    }`}
                  >
                    {new Intl.DateTimeFormat('en-GB',{
                      day:'2-digit',
                      month:'short',
                      year:'numeric'
                    }).format(new Date(nextDueBook.due_date))}
                  </p>
                  <div className="text-center">
                    <p className="font-bold text-base text-slate-900">
                      {nextDueBook.title}
                    </p>

                    <p className="text-[15px] text-slate-500">
                      {nextDueBook.author}
                    </p>
                  </div>
                  <div className="mt-4">
                    {daysRemaining >= 0 ? (
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${
                          daysRemaining < 3
                            ? 'bg-rose-100 text-rose-700'
                            : daysRemaining <= 7
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-teal-100 text-teal-700'
                        }`}
                      >
                        {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-rose-100 text-rose-700 px-3 py-1 text-sm font-bold">
                        {Math.abs(daysRemaining)} day{Math.abs(daysRemaining) !== 1 ? 's' : ''} overdue
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <div>
                  <div className="flex items-center gap-3 text-teal-600 mt-4 mb-4">
                    <span className="material-symbols-outlined text-4xl">
                      check_circle
                    </span>
                    <div>
                      <p className="font-bold text-lg">
                        No Upcoming Due Dates
                      </p>
                      <p className="text-slate-500 text-sm">
                        All library books have been returned.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="aether-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-primary">
                  info
                </span>
                <h3 className="text-lg font-bold">
                  Library Guidelines
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-emerald-500">
                    check_circle
                  </span>
                  <div>
                    <p className="font-semibold">
                      Return borrowed books
                    </p>
                    <p className="text-sm text-slate-500">
                      All issued books must be returned before clearance.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-emerald-500">
                    payments
                  </span>
                  <div>
                    <p className="font-semibold">
                      Clear pending fines
                    </p>
                    <p className="text-sm text-slate-500">
                      Outstanding dues must be paid before approval.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-emerald-500">
                    verified
                  </span>
                  <div>
                    <p className="font-semibold">
                      Library verification
                    </p>
                    <p className="text-sm text-slate-500">
                      Your application proceeds automatically once dues are cleared.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="aether-card rounded-2xl p-8">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-primary">
                  support_agent
                </span>
                Library Contact
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary">
                    person
                  </span>
                  <div>
                    <p className="font-semibold">Librarian</p>
                    <p className="text-slate-500">
                      Mrs. A. Sharma
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary">
                    call
                  </span>
                  <div>
                    <p className="font-semibold">Phone</p>
                    <p className="text-slate-500">
                      +91 22 2623 2100
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary">
                    mail
                  </span>
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-slate-500">
                      library@spit.ac.in
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary">
                    schedule
                  </span>
                  <div>
                    <p className="font-semibold">Working Hours</p>
                    <p className="text-slate-500">
                      Mon–Fri • 9:00 AM – 5:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </section>
  );
}
