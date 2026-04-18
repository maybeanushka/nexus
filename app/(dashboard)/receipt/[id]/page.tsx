import { getSession } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Transaction } from '@/lib/models';
import { redirect } from 'next/navigation';
import PrintButton from '@/components/PrintButton';
import ReceiptQR from './ReceiptQR';

export default async function ReceiptPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { id } = await params;

  await dbConnect();
  const transaction = await Transaction.findById(id).populate('student_id').lean() as any;

  if (!transaction) return <div>Receipt not found.</div>;
  const student = transaction.student_id;

  return (
    <div className="min-h-screen bg-slate-50 p-10 flex items-center justify-center">
      <div className="bg-white w-[800px] p-12 shadow-2xl rounded-sm border border-slate-200 relative overflow-hidden">
        {/* Security Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] rotate-[-45deg] pointer-events-none select-none">
          <p className="text-9xl font-black">NEXUS SECURE</p>
        </div>

        <div className="flex justify-between items-start mb-16 border-b-2 border-slate-900 pb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900">NEXUS PORTAL</h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">Institutional Settlement Receipt</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Transaction ID</p>
            <p className="text-sm font-bold text-slate-900 font-mono">{transaction._id.toString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-16">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Name</p>
              <p className="text-lg font-bold text-slate-900">{student.name}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registration Number</p>
              <p className="text-lg font-bold text-slate-900">{student.reg_no || 'N/A'}</p>
            </div>
          </div>
          <div className="space-y-4 text-right">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date of Settlement</p>
              <p className="text-lg font-bold text-slate-900">{new Date(transaction.created_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
              <p className="text-lg font-bold text-teal-600 uppercase tracking-wider">{transaction.status}</p>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-100">
                <th className="py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Description</th>
                <th className="py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-6 text-sm font-bold text-slate-900">Institutional Clearance Protocol Settlement</td>
                <td className="py-6 text-right text-xl font-black text-slate-900">₹{transaction.amount}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-end border-t border-slate-100 pt-12">
          <div className="w-32 h-32 bg-slate-50 border border-slate-100 flex flex-col items-center justify-center p-2 rounded">
            <ReceiptQR value={transaction.qr_data} />
            <p className="text-[8px] font-bold text-slate-400 mt-2">QR VERIFICATION</p>
          </div>
          <div className="text-right">
            <div className="mb-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Digital Seal</p>
              <p className="text-xl font-black italic text-slate-300">Nexus Registrar Services</p>
            </div>
            <PrintButton />
          </div>
        </div>
      </div>
    </div>
  );
}
