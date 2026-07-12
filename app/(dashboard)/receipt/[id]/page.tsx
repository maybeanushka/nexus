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
      <div id="receipt" className="bg-white max-w-[950px] w-full p-12 shadow-2xl rounded-sm border border-slate-200 relative overflow-hidden">
        {/* Security Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.015] rotate-[-45deg] pointer-events-none select-none">
          <p className="text-7xl font-black">NEXUS SECURE</p>
        </div>

        <div className="flex justify-between items-start mb-14 border-b-2 border-slate-900 pb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900">NEXUS PORTAL</h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">Official Payment Receipt</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Transaction ID</p>
            <p className="text-sm font-bold text-slate-900 font-mono">{transaction._id.toString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-20 mb-14">

          <div className="space-y-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Student Name
              </p>
              <p className="text-lg font-bold">
                {student.name}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Registration Number
              </p>
              <p className="text-lg font-bold">
                {student.reg_no || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Payment Method
              </p>
              <p className="font-semibold">
                Online Payment
              </p>
            </div>
          </div>

          <div className="space-y-5 text-right">

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Receipt No.
              </p>

              <p className="font-mono font-bold">
                RCP-{transaction._id.toString().slice(0,8).toUpperCase()}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Date of Settlement
              </p>

              <p className="font-semibold">
                {new Date(transaction.created_at).toLocaleDateString("en-GB",{
                  day:"2-digit",
                  month:"short",
                  year:"numeric"
                })}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Status
              </p>

              <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                SUCCESS
              </span>
            </div>

          </div>

        </div>

        <div className="mb-14">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-100">
                <th className="py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Description</th>
                <th className="py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">

              <td className="py-5">
              Graduation Clearance Fee
              </td>

              <td className="py-5 text-right">
              ₹{transaction.amount}
              </td>

              </tr>

              <tr>

              <td className="pt-5 text-lg font-black">
              Total
              </td>

              <td className="pt-5 text-right text-3xl font-black text-primary">
              ₹{transaction.amount}
              </td>

              </tr>

              </tbody>
          </table>
          <div className="mt-14 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
            Remarks
            </p>

            <p className="text-sm text-slate-600 leading-6">
            Payment received successfully. This receipt confirms settlement of the
            Graduation Clearance Fee. Please retain this receipt for future
            reference.
            </p>
            </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-10 border-t border-slate-200 pt-8">
          <div className="w-40 h-40 bg-slate-50 border border-slate-100 flex flex-col items-center justify-center p-2 rounded">
            <ReceiptQR value={transaction.qr_data} />
            <p className="mt-2 text-[9px] font-bold text-slate-500">Scan to verify</p>
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
