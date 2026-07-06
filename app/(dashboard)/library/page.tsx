import { getSession } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Due } from '@/lib/models';
import { redirect } from 'next/navigation';
import LibraryDuesList from './LibraryDuesList';

export default async function LibraryPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  await dbConnect();
  const dues = await Due.find({ student_id: session.userId, type: 'library' }).lean() as any[];

  return (
    <section>
      <div className="mb-10">
        <h2 className="text-4xl font-black tracking-tight text-on-surface mb-2">Institutional Library</h2>
        <p className="text-on-surface-variant text-lg">Review pending books, accumulated fines, and settle your library protocol.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <LibraryDuesList dues={dues} />
        </div>
        
        <div className="space-y-6">
          <div className="aether-card rounded-2xl p-8 bg-indigo-900 text-white">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">info</span>
              Settlement Protocol
            </h3>
            <p className="text-indigo-200 text-sm leading-relaxed mb-6">
              All pending books must be returned and fines cleared before the clearance protocol can advance to the HOD stage.
            </p>
            <div className="p-4 bg-white/10 rounded-xl border border-white/10">
              <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">Total Fine Amount</p>
              <p className="text-3xl font-black mt-1">₹{dues.filter(d => d.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0)}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
