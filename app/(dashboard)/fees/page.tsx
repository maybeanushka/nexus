import { getSession } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Due } from '@/lib/models';
import { redirect } from 'next/navigation';

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
      <div className="mb-10">
        <h2 className="text-4xl font-black tracking-tight text-on-surface mb-2">Financial Protocol</h2>
        <p className="text-on-surface-variant text-lg">Detailed breakdown of all institutional dues and settlement history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="aether-card rounded-2xl p-8">
            <h3 className="text-xl font-black mb-8 border-b border-slate-100 pb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
              Dues Breakdown
            </h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                    <span className="material-symbols-outlined">local_library</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Library Fines</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pending Records</p>
                  </div>
                </div>
                <p className="text-lg font-black text-slate-900">₹{libraryTotal}</p>
              </div>

              <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                    <span className="material-symbols-outlined">home</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Hostel & Repair Charges</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Calculated Dues</p>
                  </div>
                </div>
                <p className="text-lg font-black text-slate-900">₹{hostelTotal}</p>
              </div>

              <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                    <span className="material-symbols-outlined">receipt_long</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Miscellaneous Fees</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Extra Services</p>
                  </div>
                </div>
                <p className="text-lg font-black text-slate-900">₹{miscTotal}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="aether-card rounded-2xl p-8 border-t-4 border-t-primary">
            <h3 className="text-lg font-bold mb-6 uppercase tracking-tighter">Settlement Summary</h3>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-medium">Subtotal Dues</span>
                <span className="text-slate-900 font-bold">₹{totalPayable}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-medium">Processing Fee</span>
                <span className="text-slate-900 font-bold">₹0.00</span>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between">
                <span className="text-slate-900 font-black">Total Payable</span>
                <span className="text-2xl font-black text-primary">₹{totalPayable}</span>
              </div>
            </div>
            <button className="w-full py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-all">
              Initialize Payment Protocol
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
